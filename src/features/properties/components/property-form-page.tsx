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
import { useRouter } from 'next/navigation';
import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { LuArrowLeft, LuMenu, LuTrash2, LuUpload } from 'react-icons/lu';
import {
  useCreateProperty,
  useUpdateProperty,
} from '@/features/properties/hooks/use-property-mutations';
import { useProperties } from '@/features/properties/hooks/use-properties';
import {
  AMENITY_OPTIONS,
  CURRENCY_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  TIMEZONE_OPTIONS,
  createEmptyPropertyForm,
  propertyToFormValues,
  readFilesAsImageDrafts,
  validatePropertyForm,
  type PropertyFormErrors,
  type PropertyFormValues,
} from '@/features/properties/utils/property-form';
import { useUnits } from '@/features/units/hooks/use-units';
import {
  ErrorState,
  PageHeader,
  PageSkeleton,
  Panel,
} from '@/shared/components/ui';
import { useUiStore } from '@/shared/store/ui-store';

type PropertyFormPageProps = {
  mode: 'create' | 'edit';
  id?: number;
};

export function PropertyFormPage({ mode, id }: PropertyFormPageProps) {
  const isEdit = mode === 'edit';
  const router = useRouter();
  const toast = useToast();
  const fileInputId = useId();
  const openMobileNav = useUiStore((state) => state.openMobileNav);
  const createMutation = useCreateProperty();
  const updateMutation = useUpdateProperty();
  const {
    data: properties,
    isLoading: propertiesLoading,
    isError: propertiesError,
    error: propertiesErrorValue,
    refetch,
  } = useProperties();
  const { data: units = [], isLoading: unitsLoading } = useUnits();

  const property = useMemo(() => {
    if (!isEdit || id === undefined) return null;
    return properties?.find((item) => item.id === id) ?? null;
  }, [isEdit, properties, id]);

  const unitCount = useMemo(() => {
    if (!property) return 1;
    return units.filter((unit) => unit.property_id === property.id).length;
  }, [property, units]);

  const [values, setValues] = useState<PropertyFormValues>(createEmptyPropertyForm);
  const [errors, setErrors] = useState<PropertyFormErrors>({});
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit) {
      if (!property) return;
      const key = `${property.id}:${unitCount}:${property.updated_at}`;
      if (hydratedKey === key) return;
      setErrors({});
      setValues(propertyToFormValues(property, Math.max(unitCount, 1)));
      setHydratedKey(key);
      return;
    }

    if (hydratedKey === 'create') return;
    setErrors({});
    setValues(createEmptyPropertyForm());
    setHydratedKey('create');
  }, [hydratedKey, isEdit, property, unitCount]);

  const isLoading = isEdit && (propertiesLoading || unitsLoading);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const goBack = () => {
    router.push('/properties');
  };

  const updateField = <K extends keyof PropertyFormValues>(
    key: K,
    value: PropertyFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const toggleAmenity = (amenity: string) => {
    setValues((current) => {
      const exists = current.amenities.includes(amenity);
      return {
        ...current,
        amenities: exists
          ? current.amenities.filter((item) => item !== amenity)
          : [...current.amenities, amenity],
      };
    });
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    try {
      const drafts = await readFilesAsImageDrafts(fileList);
      setValues((current) => ({
        ...current,
        images: [
          ...current.images,
          ...drafts.map((draft, index) => ({
            ...draft,
            sort_order: current.images.length + index,
          })),
        ],
      }));
    } catch {
      toast({
        title: 'Could not read image files',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const removeImage = (id: string) => {
    setValues((current) => ({
      ...current,
      images: current.images
        .filter((image) => image.id !== id)
        .map((image, index) => ({ ...image, sort_order: index })),
    }));
  };

  const handleSubmit = async () => {
    const nextErrors = validatePropertyForm(values);
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
      if (isEdit && property) {
        await updateMutation.mutateAsync({ id: property.id, values });
        toast({
          title: 'Property updated',
          status: 'success',
          duration: 2500,
          isClosable: true,
        });
      } else {
        await createMutation.mutateAsync(values);
        toast({
          title: 'Property created',
          status: 'success',
          duration: 2500,
          isClosable: true,
        });
      }
      router.push('/properties');
    } catch (error) {
      toast({
        title: isEdit ? 'Failed to update property' : 'Failed to create property',
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

  if (propertiesError) {
    return (
      <ErrorState
        message={
          propertiesErrorValue instanceof Error
            ? propertiesErrorValue.message
            : 'Failed to load properties'
        }
        onRetry={() => void refetch()}
      />
    );
  }

  if (isEdit && !property) {
    return (
      <ErrorState
        title="Property not found"
        message="This property may have been removed or the link is invalid."
        onRetry={goBack}
        retryLabel="Back to properties"
      />
    );
  }

  return (
    <Box maxW="920px">
      <PageHeader
        title={isEdit ? 'Edit property' : 'Add property'}
        description={
          isEdit
            ? `Update details for ${property?.name ?? 'this property'}.`
            : 'Create a listing with units, availability, and photos.'
        }
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
              {isEdit ? 'Save changes' : 'Create property'}
            </Button>
          </>
        }
      />

      <Panel>
        <Flex direction="column" gap="22px">
          <Section title="Basics">
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="14px">
              <Field label="Property name" isRequired error={errors.name}>
                <Input
                  value={values.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  placeholder="e.g. Azure Lekki"
                  {...inputProps}
                />
              </Field>
              <Field label="Public name">
                <Input
                  value={values.public_name}
                  onChange={(event) =>
                    updateField('public_name', event.target.value)
                  }
                  placeholder="Guest-facing title"
                  {...inputProps}
                />
              </Field>
              <Field label="Property type">
                <Select
                  value={values.property_type}
                  onChange={(event) =>
                    updateField('property_type', event.target.value)
                  }
                  {...inputProps}
                >
                  {PROPERTY_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label="Number of units"
                isRequired
                error={errors.unit_count}
                helper="Creates or trims unit inventory for this property."
              >
                <Input
                  type="number"
                  min={1}
                  value={values.unit_count}
                  onChange={(event) =>
                    updateField('unit_count', Number(event.target.value))
                  }
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
                  Available for booking
                </Text>
                <Text fontSize="13px" color="ink.300">
                  Listed properties appear on channels and direct booking.
                </Text>
              </Box>
              <Switch
                isChecked={values.listed}
                onChange={(event) =>
                  updateField('listed', event.target.checked)
                }
                colorScheme="green"
              />
            </Flex>
          </Section>

          <Section title="Location">
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="14px">
              <Field label="Street address" isRequired error={errors.line1}>
                <Input
                  value={values.line1}
                  onChange={(event) => updateField('line1', event.target.value)}
                  placeholder="12 Admiralty Way"
                  {...inputProps}
                />
              </Field>
              <Field label="Address line 2">
                <Input
                  value={values.line2}
                  onChange={(event) => updateField('line2', event.target.value)}
                  placeholder="Apartment, suite, landmark"
                  {...inputProps}
                />
              </Field>
              <Field label="City" isRequired error={errors.city}>
                <Input
                  value={values.city}
                  onChange={(event) => updateField('city', event.target.value)}
                  {...inputProps}
                />
              </Field>
              <Field label="State / region">
                <Input
                  value={values.state}
                  onChange={(event) => updateField('state', event.target.value)}
                  {...inputProps}
                />
              </Field>
              <Field label="Postal code">
                <Input
                  value={values.zip}
                  onChange={(event) => updateField('zip', event.target.value)}
                  {...inputProps}
                />
              </Field>
              <Field label="Country" isRequired error={errors.country}>
                <Input
                  value={values.country}
                  onChange={(event) =>
                    updateField('country', event.target.value)
                  }
                  maxLength={2}
                  textTransform="uppercase"
                  {...inputProps}
                />
              </Field>
            </Grid>
          </Section>

          <Section title="Capacity">
            <Grid
              templateColumns={{ base: '1fr 1fr', md: 'repeat(4, 1fr)' }}
              gap="14px"
            >
              <Field label="Max guests" isRequired error={errors.max_guests}>
                <Input
                  type="number"
                  min={1}
                  value={values.max_guests}
                  onChange={(event) =>
                    updateField('max_guests', Number(event.target.value))
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

          <Section title="Operations">
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="14px">
              <Field label="Check-in time">
                <Input
                  type="time"
                  value={values.check_in}
                  onChange={(event) =>
                    updateField('check_in', event.target.value)
                  }
                  {...inputProps}
                />
              </Field>
              <Field label="Checkout time">
                <Input
                  type="time"
                  value={values.check_out}
                  onChange={(event) =>
                    updateField('check_out', event.target.value)
                  }
                  {...inputProps}
                />
              </Field>
              <Field label="Timezone">
                <Select
                  value={values.timezone}
                  onChange={(event) =>
                    updateField('timezone', event.target.value)
                  }
                  {...inputProps}
                >
                  {TIMEZONE_OPTIONS.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Currency">
                <Select
                  value={values.currency}
                  onChange={(event) =>
                    updateField('currency', event.target.value)
                  }
                  {...inputProps}
                >
                  {CURRENCY_OPTIONS.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </Select>
              </Field>
            </Grid>
          </Section>

          <Section title="Description">
            <Grid gap="14px">
              <Field label="Summary">
                <Input
                  value={values.summary}
                  onChange={(event) =>
                    updateField('summary', event.target.value)
                  }
                  placeholder="Short one-line summary"
                  {...inputProps}
                />
              </Field>
              <Field label="Description">
                <Textarea
                  value={values.description}
                  onChange={(event) =>
                    updateField('description', event.target.value)
                  }
                  placeholder="Tell guests what makes this stay special"
                  minH="110px"
                  borderColor="line.500"
                  borderRadius="12px"
                />
              </Field>
            </Grid>
          </Section>

          <Section title="Amenities">
            <Grid
              templateColumns={{ base: '1fr 1fr', md: 'repeat(3, 1fr)' }}
              gap="10px"
            >
              {AMENITY_OPTIONS.map((option) => (
                <Checkbox
                  key={option.value}
                  isChecked={values.amenities.includes(option.value)}
                  onChange={() => toggleAmenity(option.value)}
                  borderColor="line.500"
                >
                  {option.label}
                </Checkbox>
              ))}
            </Grid>
          </Section>

          <Section title="Images">
            <FormControl>
              <FormLabel fontSize="12px" fontWeight={700} color="ink.300">
                Upload photos
              </FormLabel>
              <Input
                id={fileInputId}
                type="file"
                accept="image/*"
                multiple
                display="none"
                onChange={(event) => {
                  void handleFiles(event.target.files);
                  event.target.value = '';
                }}
              />
              <Button
                as="label"
                htmlFor={fileInputId}
                variant="secondary"
                leftIcon={<LuUpload size={16} />}
                borderRadius="12px"
                h="40px"
                cursor="pointer"
              >
                Choose files
              </Button>
              <FormHelperText color="ink.300">
                First image becomes the cover photo. Files stay local in this
                mock session (data URLs).
              </FormHelperText>
            </FormControl>

            {values.images.length > 0 ? (
              <Grid
                mt="14px"
                templateColumns={{
                  base: '1fr',
                  sm: '1fr 1fr',
                  md: 'repeat(3, 1fr)',
                }}
                gap="12px"
              >
                {values.images.map((image, index) => (
                  <Box
                    key={image.id}
                    border="1px solid"
                    borderColor="line.500"
                    borderRadius="14px"
                    overflow="hidden"
                    bg="bg.400"
                  >
                    <Box
                      as="img"
                      src={image.url}
                      alt={image.caption || `Property image ${index + 1}`}
                      w="100%"
                      h="120px"
                      objectFit="cover"
                    />
                    <Flex p="10px" gap="8px" align="center">
                      <Input
                        size="sm"
                        value={image.caption}
                        placeholder={index === 0 ? 'Cover photo' : 'Caption'}
                        borderRadius="10px"
                        borderColor="line.500"
                        bg="white"
                        onChange={(event) =>
                          setValues((current) => ({
                            ...current,
                            images: current.images.map((item) =>
                              item.id === image.id
                                ? { ...item, caption: event.target.value }
                                : item,
                            ),
                          }))
                        }
                      />
                      <IconButton
                        aria-label="Remove image"
                        icon={<LuTrash2 size={14} />}
                        size="sm"
                        variant="secondary"
                        borderRadius="10px"
                        onClick={() => removeImage(image.id)}
                      />
                    </Flex>
                  </Box>
                ))}
              </Grid>
            ) : (
              <Text mt="12px" fontSize="13px" color="ink.300">
                No images added yet.
              </Text>
            )}
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
              {isEdit ? 'Save changes' : 'Create property'}
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
