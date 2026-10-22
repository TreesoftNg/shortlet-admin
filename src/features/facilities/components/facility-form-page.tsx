'use client';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LuArrowLeft, LuMenu } from 'react-icons/lu';
import { useMe } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/utils/auth-helpers';
import {
  EmptyState,
  ErrorState,
  FormPanel,
  FormPanelBody,
  PageHeader,
  PageSkeleton,
  Panel,
} from '@/shared/components/ui';
import { useUiStore } from '@/shared/store/ui-store';
import { useFacility } from '../hooks/use-facility';
import {
  useCreateFacility,
  useUpdateFacility,
} from '../hooks/use-facility-mutations';
import {
  emptyFacilityForm,
  facilityFormFrom,
  FACILITY_CATEGORY_MAX,
  FACILITY_NAME_MAX,
  toFacilityInput,
  validateFacilityForm,
  type FacilityFormErrors,
  type FacilityFormValues,
} from '../utils/facility-form';

const inputProps = {
  borderColor: 'line.500',
  borderRadius: '12px',
  h: '44px',
  bg: 'white',
} as const;

type FacilityFormPageProps = {
  mode: 'create' | 'edit';
  id?: string;
};

export function FacilityFormPage({ mode, id }: FacilityFormPageProps) {
  const isEdit = mode === 'edit';
  const router = useRouter();
  const toast = useToast();
  const openMobileNav = useUiStore((state) => state.openMobileNav);
  const { data: profile } = useMe();
  const canManage = hasPermission(profile, 'property.update');

  const create = useCreateFacility();
  const update = useUpdateFacility();
  const {
    data: facility,
    isLoading: facilityLoading,
    isError: facilityError,
    error: facilityErrorValue,
    refetch,
  } = useFacility(isEdit ? id : undefined);

  const [values, setValues] = useState<FacilityFormValues>(emptyFacilityForm);
  const [errors, setErrors] = useState<FacilityFormErrors>({});
  const [hydratedId, setHydratedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) {
      if (hydratedId === 'create') return;
      setValues(emptyFacilityForm());
      setErrors({});
      setHydratedId('create');
      return;
    }
    if (!facility || hydratedId === facility.id) return;
    setValues(facilityFormFrom(facility));
    setErrors({});
    setHydratedId(facility.id);
  }, [facility, hydratedId, isEdit]);

  const isSaving = create.isPending || update.isPending;
  const goBack = () => router.push('/facilities');

  const updateField = <K extends keyof FacilityFormValues>(
    key: K,
    value: FacilityFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async () => {
    const nextErrors = validateFacilityForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const input = toFacilityInput(values);
    try {
      if (isEdit) {
        if (!facility) return;
        await update.mutateAsync({ id: facility.id, input });
        toast({
          title: 'Facility updated',
          status: 'success',
          duration: 2500,
          isClosable: true,
        });
      } else {
        await create.mutateAsync(input);
        toast({
          title: 'Facility created',
          status: 'success',
          duration: 2500,
          isClosable: true,
        });
      }
      router.push('/facilities');
    } catch (error) {
      toast({
        title: isEdit ? 'Failed to update facility' : 'Failed to create facility',
        description: error instanceof Error ? error.message : undefined,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  if (!canManage) {
    return (
      <Box>
        <PageHeader
          title={isEdit ? 'Edit facility' : 'Add facility'}
          description="Amenities and features for your properties and units."
        />
        <Panel>
          <EmptyState
            title="No access"
            description="Your role cannot change facilities. Ask the business owner for access."
          />
        </Panel>
      </Box>
    );
  }

  if (isEdit && facilityLoading) {
    return <PageSkeleton variant="form" />;
  }

  if (isEdit && facilityError) {
    return (
      <ErrorState
        message={
          facilityErrorValue instanceof Error
            ? facilityErrorValue.message
            : 'Failed to load facility'
        }
        onRetry={() => void refetch()}
      />
    );
  }

  if (isEdit && !facility) {
    return (
      <ErrorState
        title="Facility not found"
        message="This facility may have been removed or the link is invalid."
        onRetry={goBack}
        retryLabel="Back to facilities"
      />
    );
  }

  if (isEdit && facility?.status === 'archived') {
    return (
      <ErrorState
        title="Facility is archived"
        message="Restore it from the facilities list before editing."
        onRetry={goBack}
        retryLabel="Back to facilities"
      />
    );
  }

  return (
    <Box maxW="720px">
      <PageHeader
        title={isEdit ? 'Edit facility' : 'Add facility'}
        description={
          isEdit
            ? `Update details for ${facility?.name ?? 'this facility'}.`
            : 'Add an amenity or feature to use on properties and units.'
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
          </>
        }
      />

      <FormPanel
        title="Details"
        description="Name is required. Category is optional and helps group facilities in pickers."
        footer={
          <Flex w="100%" justify="flex-end">
            <Button
              onClick={() => void handleSubmit()}
              isLoading={isSaving}
              loadingText={isEdit ? 'Saving' : 'Creating'}
            >
              {isEdit ? 'Save changes' : 'Add facility'}
            </Button>
          </Flex>
        }
      >
        <FormPanelBody>
          <FormControl isInvalid={Boolean(errors.name)}>
            <FormLabel>Name</FormLabel>
            <Input
              {...inputProps}
              value={values.name}
              maxLength={FACILITY_NAME_MAX}
              placeholder="e.g. Wi-Fi"
              onChange={(event) => updateField('name', event.target.value)}
            />
            {errors.name ? (
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            ) : null}
          </FormControl>

          <FormControl isInvalid={Boolean(errors.category)}>
            <FormLabel>Category (optional)</FormLabel>
            <Input
              {...inputProps}
              value={values.category}
              maxLength={FACILITY_CATEGORY_MAX}
              placeholder="e.g. Essentials"
              onChange={(event) => updateField('category', event.target.value)}
            />
            {errors.category ? (
              <FormErrorMessage>{errors.category}</FormErrorMessage>
            ) : (
              <Text mt="6px" fontSize="13px" color="ink.300">
                Shown next to the name in property and unit forms.
              </Text>
            )}
          </FormControl>
        </FormPanelBody>
      </FormPanel>
    </Box>
  );
}
