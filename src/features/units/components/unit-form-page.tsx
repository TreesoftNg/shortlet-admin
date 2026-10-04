'use client';

import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  Input,
  Select,
  Switch,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { LuArrowLeft, LuMenu, LuTrash2, LuUpload } from 'react-icons/lu';
import { useProperties } from '@/features/properties/hooks/use-properties';
import { useFacilities } from '@/features/units/hooks/use-facilities';
import {
  useCreateUnit,
  useUpdateUnit,
} from '@/features/units/hooks/use-unit-mutations';
import { useUnit } from '@/features/units/hooks/use-units';
import {
  UNIT_STATUS_OPTIONS,
  createEmptyUnitForm,
  readFileAsDataUrl,
  unitToFormValues,
  validateUnitForm,
  type UnitFormErrors,
  type UnitFormValues,
} from '@/features/units/utils/unit-form';
import {
  ErrorState,
  PageHeader,
  PageSkeleton,
  Panel,
} from '@/shared/components/ui';
import { useUiStore } from '@/shared/store/ui-store';
import { parsePropertyIdFilter } from '@/shared/utils/property-id';

type UnitFormPageProps = {
  mode: 'create' | 'edit';
  id?: string;
};

export function UnitFormPage({ mode, id }: UnitFormPageProps) {
  const isEdit = mode === 'edit';
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const fileInputId = useId();
  const openMobileNav = useUiStore((state) => state.openMobileNav);
  const createMutation = useCreateUnit();
  const updateMutation = useUpdateUnit();

  const preferredPropertyId = useMemo(() => {
    if (isEdit) return undefined;
    const parsed = parsePropertyIdFilter(searchParams.get('propertyId') ?? '');
    return parsed === 'all' ? undefined : parsed;
  }, [isEdit, searchParams]);

  const {
    data: unit,
    isLoading: unitLoading,
    isError: unitError,
    error: unitErrorValue,
    refetch: refetchUnit,
  } = useUnit(isEdit ? id : undefined);
  const {
    data: properties = [],
    isLoading: propertiesLoading,
    isError: propertiesError,
    error: propertiesErrorValue,
    refetch: refetchProperties,
  } = useProperties();
  const {
    data: facilities = [],
    isLoading: facilitiesLoading,
    isError: facilitiesError,
    error: facilitiesErrorValue,
    refetch: refetchFacilities,
  } = useFacilities();

  const [values, setValues] = useState<UnitFormValues>(createEmptyUnitForm);
  const [errors, setErrors] = useState<UnitFormErrors>({});
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);

  const property = useMemo(() => {
    if (values.property_id === '') return null;
    return (
      properties.find((item) => String(item.id) === values.property_id) ?? null
    );
  }, [properties, values.property_id]);

  useEffect(() => {
    if (isEdit) {
      if (!unit) return;
      const key = `${unit.id}:${unit.updated_at}`;
      if (hydratedKey === key) return;
      setErrors({});
      setValues(unitToFormValues(unit));
      setHydratedKey(key);
      return;
    }

    if (hydratedKey === 'create') return;
    const defaultProperty =
      (preferredPropertyId
        ? properties.find((item) => String(item.id) === preferredPropertyId)
        : null) ?? properties[0];
    setErrors({});
    setValues(
      defaultProperty
        ? {
            ...createEmptyUnitForm(String(defaultProperty.id)),
            capacity: defaultProperty.capacity.max,
            bedrooms: defaultProperty.capacity.bedrooms,
            beds: defaultProperty.capacity.beds,
            bathrooms: defaultProperty.capacity.bathrooms,
          }
        : createEmptyUnitForm(),
    );
    setHydratedKey('create');
  }, [hydratedKey, isEdit, preferredPropertyId, properties, unit]);

  const isLoading =
    propertiesLoading || facilitiesLoading || (isEdit && unitLoading);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const goBack = () => {
    router.push('/units');
  };

  const updateField = <K extends keyof UnitFormValues>(
    key: K,
    value: UnitFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const toggleFacility = (facilityId: string) => {
    setValues((current) => {
      const exists = current.facility_ids.includes(facilityId);
      return {
        ...current,
        facility_ids: exists
          ? current.facility_ids.filter((item) => item !== facilityId)
          : [...current.facility_ids, facilityId],
      };
    });
  };

  const handleFile = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    try {
      const url = await readFileAsDataUrl(file);
      updateField('picture', url);
    } catch (error) {
      toast({
        title: 'Could not read image',
        description: error instanceof Error ? error.message : undefined,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = async () => {
    const nextErrors = validateUnitForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast({
        title: 'Please fix the highlighted fields',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      if (isEdit && unit) {
        await updateMutation.mutateAsync({ id: unit.id, values });
        toast({
          title: 'Unit updated',
          status: 'success',
          duration: 2500,
          isClosable: true,
        });
      } else {
        await createMutation.mutateAsync(values);
        toast({
          title: 'Unit created',
          status: 'success',
          duration: 2500,
          isClosable: true,
        });
      }
      router.push('/units');
    } catch (error) {
      toast({
        title: isEdit ? 'Failed to update unit' : 'Failed to create unit',
        description: error instanceof Error ? error.message : undefined,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return <PageSkeleton variant="form" />;
  }

  if (unitError || propertiesError || facilitiesError) {
    return (
      <ErrorState
        message={
          (unitErrorValue instanceof Error
            ? unitErrorValue.message
            : null) ??
          (propertiesErrorValue instanceof Error
            ? propertiesErrorValue.message
            : null) ??
          (facilitiesErrorValue instanceof Error
            ? facilitiesErrorValue.message
            : null) ??
          'Failed to load unit form'
        }
        onRetry={() => {
          if (unitError) void refetchUnit();
          if (propertiesError) void refetchProperties();
          if (facilitiesError) void refetchFacilities();
        }}
      />
    );
  }

  if (isEdit && !unit) {
    return (
      <ErrorState
        title="Unit not found"
        message="This unit may have been removed or the link is invalid."
        onRetry={goBack}
        retryLabel="Back to units"
      />
    );
  }

  if (!isEdit && properties.length === 0) {
    return (
      <ErrorState
        title="No properties yet"
        message="Create a property before adding units."
        onRetry={() => router.push('/properties/new')}
        retryLabel="Add property"
      />
    );
  }

  return (
    <Box maxW="820px">
      <PageHeader
        title={isEdit ? 'Edit unit' : 'Add unit'}
        description="Configure inventory and unit amenities. Address and gallery stay on the property."
        actions={
          <>
            <IconButton
              aria-label="Open navigation"
              icon={<LuMenu size={20} />}
              display={{ base: 'inline-flex', lg: 'none' }}
              variant="secondary"
              borderRadius="12px"
              h="44px"
              w="44px"
              onClick={openMobileNav}
            />
            <Button
              variant="secondary"
              leftIcon={<LuArrowLeft size={16} />}
              borderRadius="12px"
              h="44px"
              onClick={goBack}
              isDisabled={isSaving}
            >
              Back
            </Button>
            <Button
              h="44px"
              borderRadius="12px"
              onClick={() => void handleSubmit()}
              isLoading={isSaving}
              loadingText={isEdit ? 'Saving' : 'Creating'}
            >
              {isEdit ? 'Save changes' : 'Create unit'}
            </Button>
          </>
        }
      />

      <Panel>
        <Flex direction="column" gap="22px">
          <Box
            bg="bg.400"
            borderRadius="14px"
            px="14px"
            py="12px"
            border="1px solid"
            borderColor="line.500"
          >
            <Text fontSize="13px" color="ink.400">
              Address, currency, and gallery stay on the property. Amenities are
              set per unit — seed from the property when you pick one, then
              customise.
            </Text>
          </Box>

          <Section title="Basics">
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="14px">
              <Field label="Property" isRequired error={errors.property_id}>
                <Select
                  value={
                    values.property_id === '' ? '' : String(values.property_id)
                  }
                  onChange={(event) => {
                    const nextId = event.target.value;
                    const nextProperty = nextId
                      ? properties.find((item) => String(item.id) === nextId)
                      : null;
                    setValues((current) => ({
                      ...current,
                      property_id: nextId,
                      ...(nextProperty && !isEdit
                        ? {
                            capacity: nextProperty.capacity.max,
                            bedrooms: nextProperty.capacity.bedrooms,
                            beds: nextProperty.capacity.beds,
                            bathrooms: nextProperty.capacity.bathrooms,
                          }
                        : {}),
                    }));
                    setErrors((current) => {
                      if (!current.property_id) return current;
                      const next = { ...current };
                      delete next.property_id;
                      return next;
                    });
                  }}
                  {...inputProps}
                >
                  <option value="" disabled>
                    Select property
                  </option>
                  {properties.map((item) => (
                    <option key={item.id} value={String(item.id)}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Status" isRequired>
                <Select
                  value={values.status}
                  onChange={(event) =>
                    updateField(
                      'status',
                      event.target.value as UnitFormValues['status'],
                    )
                  }
                  {...inputProps}
                >
                  {UNIT_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Code" isRequired error={errors.code}>
                <Input
                  value={values.code}
                  onChange={(event) => updateField('code', event.target.value)}
                  placeholder="e.g. A, S1, PH-1"
                  {...inputProps}
                />
              </Field>
              <Field label="Name" isRequired error={errors.name}>
                <Input
                  value={values.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  placeholder="e.g. Unit A"
                  {...inputProps}
                />
              </Field>
              <Field label="Floor / location">
                <Input
                  value={values.floor}
                  onChange={(event) => updateField('floor', event.target.value)}
                  placeholder="e.g. 3rd floor, Garden, Penthouse"
                  {...inputProps}
                />
              </Field>
              <Field label="Short summary">
                <Input
                  value={values.summary}
                  onChange={(event) =>
                    updateField('summary', event.target.value)
                  }
                  placeholder="Optional calendar/list label"
                  {...inputProps}
                />
              </Field>
            </Grid>

            <Flex
              mt="14px"
              align="center"
              justify="space-between"
              gap="12px"
              bg="bg.400"
              borderRadius="14px"
              px="14px"
              py="12px"
            >
              <Box>
                <Text fontWeight={700} fontSize="14px">
                  Open for booking
                </Text>
                <Text fontSize="13px" color="ink.300">
                  Close inventory without archiving the unit.
                </Text>
              </Box>
              <Switch
                isChecked={values.bookable}
                onChange={(event) =>
                  updateField('bookable', event.target.checked)
                }
                colorScheme="green"
              />
            </Flex>
          </Section>

          <Section title="Layout">
            <Grid
              templateColumns={{ base: '1fr 1fr', md: 'repeat(4, 1fr)' }}
              gap="14px"
            >
              <Field label="Max guests" isRequired error={errors.capacity}>
                <Input
                  type="number"
                  min={1}
                  value={values.capacity}
                  onChange={(event) =>
                    updateField('capacity', Number(event.target.value))
                  }
                  {...inputProps}
                />
              </Field>
              <Field label="Bedrooms" error={errors.bedrooms}>
                <Input
                  type="number"
                  min={0}
                  value={values.bedrooms}
                  onChange={(event) =>
                    updateField('bedrooms', Number(event.target.value))
                  }
                  {...inputProps}
                />
              </Field>
              <Field label="Beds" error={errors.beds}>
                <Input
                  type="number"
                  min={0}
                  value={values.beds}
                  onChange={(event) =>
                    updateField('beds', Number(event.target.value))
                  }
                  {...inputProps}
                />
              </Field>
              <Field label="Bathrooms" error={errors.bathrooms}>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={values.bathrooms}
                  onChange={(event) =>
                    updateField('bathrooms', Number(event.target.value))
                  }
                  {...inputProps}
                />
              </Field>
            </Grid>
          </Section>

          <Section title="Facilities">
            <Text fontSize="13px" color="ink.300" mb="12px">
              Pick from your facility catalog. Sending a save replaces the full
              list on this unit.
            </Text>
            {facilities.length === 0 ? (
              <Text fontSize="14px" color="ink.300">
                No facilities in the catalog yet.
              </Text>
            ) : (
              <Grid
                templateColumns={{ base: '1fr 1fr', md: 'repeat(3, 1fr)' }}
                gap="10px"
              >
                {facilities.map((facility) => (
                  <Checkbox
                    key={facility.id}
                    isChecked={values.facility_ids.includes(facility.id)}
                    onChange={() => toggleFacility(facility.id)}
                    borderColor="line.500"
                  >
                    {facility.name}
                    {facility.category ? (
                      <Text as="span" color="ink.300" fontSize="12px">
                        {` · ${facility.category}`}
                      </Text>
                    ) : null}
                  </Checkbox>
                ))}
              </Grid>
            )}
          </Section>

          <Section title="Rates & discounts">
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="14px">
              <Field
                label="Base nightly rate"
                error={errors.base_rate}
                helper={
                  property
                    ? `Leave empty to inherit ${property.name} pricing (${property.currency}).`
                    : 'Leave empty to inherit property pricing.'
                }
              >
                <Input
                  type="number"
                  min={0}
                  value={values.base_rate}
                  onChange={(event) =>
                    updateField(
                      'base_rate',
                      event.target.value === ''
                        ? ''
                        : Number(event.target.value),
                    )
                  }
                  placeholder="Optional"
                  {...inputProps}
                />
              </Field>
              <Field
                label="Cleaning fee"
                error={errors.cleaning_fee}
                helper="Charged once per stay."
              >
                <Input
                  type="number"
                  min={0}
                  value={values.cleaning_fee}
                  onChange={(event) =>
                    updateField(
                      'cleaning_fee',
                      event.target.value === ''
                        ? ''
                        : Number(event.target.value),
                    )
                  }
                  placeholder="Optional"
                  {...inputProps}
                />
              </Field>
              <Field
                label="Weekly discount %"
                error={errors.weekly_discount_percent}
                helper="Off nights for stays of 7+ nights."
              >
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={values.weekly_discount_percent}
                  onChange={(event) =>
                    updateField(
                      'weekly_discount_percent',
                      event.target.value === ''
                        ? ''
                        : Number(event.target.value),
                    )
                  }
                  placeholder="Optional"
                  {...inputProps}
                />
              </Field>
              <Field
                label="Monthly discount %"
                error={errors.monthly_discount_percent}
                helper="Off nights for stays of 28+ nights."
              >
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={values.monthly_discount_percent}
                  onChange={(event) =>
                    updateField(
                      'monthly_discount_percent',
                      event.target.value === ''
                        ? ''
                        : Number(event.target.value),
                    )
                  }
                  placeholder="Optional"
                  {...inputProps}
                />
              </Field>
            </Grid>
          </Section>

          <Section title="Ops notes">
            <Field label="Internal notes">
              <Textarea
                value={values.notes}
                onChange={(event) => updateField('notes', event.target.value)}
                placeholder="Maintenance, owner holds, access quirks…"
                minH="80px"
                borderColor="line.500"
                borderRadius="12px"
              />
            </Field>
          </Section>

          <Section title="Cover photo">
            <FormControl>
              <FormLabel fontSize="12px" fontWeight={700} color="ink.300">
                Unit image
              </FormLabel>
              <Input
                id={fileInputId}
                type="file"
                accept="image/*"
                display="none"
                onChange={(event) => {
                  void handleFile(event.target.files);
                  event.target.value = '';
                }}
              />
              <Flex gap="10px" wrap="wrap" align="center">
                <Button
                  as="label"
                  htmlFor={fileInputId}
                  variant="secondary"
                  leftIcon={<LuUpload size={16} />}
                  borderRadius="12px"
                  h="40px"
                  cursor="pointer"
                >
                  Choose file
                </Button>
                {values.picture ? (
                  <Button
                    variant="secondary"
                    leftIcon={<LuTrash2 size={16} />}
                    borderRadius="12px"
                    h="40px"
                    onClick={() => updateField('picture', null)}
                  >
                    Remove
                  </Button>
                ) : null}
              </Flex>
              <FormHelperText color="ink.300">
                Optional unit cover. Property galleries stay on the property.
              </FormHelperText>
            </FormControl>

            {values.picture ? (
              <Box
                mt="14px"
                border="1px solid"
                borderColor="line.500"
                borderRadius="14px"
                overflow="hidden"
                maxW="360px"
              >
                <Box
                  as="img"
                  src={values.picture}
                  alt="Unit preview"
                  w="100%"
                  h="180px"
                  objectFit="cover"
                />
              </Box>
            ) : null}
          </Section>

          <Flex
            gap="10px"
            justify="flex-end"
            wrap="wrap"
            pt="8px"
            borderTop="1px solid"
            borderColor="line.500"
          >
            <Button
              variant="secondary"
              borderRadius="12px"
              onClick={goBack}
              isDisabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              borderRadius="12px"
              onClick={() => void handleSubmit()}
              isLoading={isSaving}
              loadingText={isEdit ? 'Saving' : 'Creating'}
            >
              {isEdit ? 'Save changes' : 'Create unit'}
            </Button>
          </Flex>
        </Flex>
      </Panel>
    </Box>
  );
}

const inputProps = {
  borderColor: 'line.500',
  borderRadius: '12px',
  h: '40px',
  bg: 'white',
} as const;

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Box>
      <Text
        fontSize="12px"
        fontWeight={800}
        textTransform="uppercase"
        letterSpacing="0.05em"
        color="ink.300"
        mb="12px"
      >
        {title}
      </Text>
      {children}
    </Box>
  );
}

function Field({
  label,
  children,
  error,
  helper,
  isRequired,
}: {
  label: string;
  children: ReactNode;
  error?: string;
  helper?: string;
  isRequired?: boolean;
}) {
  return (
    <FormControl isInvalid={Boolean(error)} isRequired={isRequired}>
      <FormLabel fontSize="12px" fontWeight={700} color="ink.300">
        {label}
      </FormLabel>
      {children}
      {helper && !error ? (
        <FormHelperText color="ink.300">{helper}</FormHelperText>
      ) : null}
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
}
