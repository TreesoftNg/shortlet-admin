'use client';
import { useState } from 'react';
import { Box, Button, Flex, Input, Select, Text } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { apiBlob, apiClient } from '@/shared/api/client';
import { apiFieldErrors } from '@/shared/api/field-errors';
import { adminPath } from '@/shared/api/paths';
import { queryKeys } from '@/shared/api/query-keys';
/** ID file types accepted on upload, and the only ones opened in a tab (the blob page runs on the admin origin). */
const ID_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];
const labels: Record<string, string> = {
  passport: 'Passport',
  nin: 'NIN',
  drivers_licence: 'Driver’s licence',
};
export function GuestIdRow({
  bookingId,
  document,
  canAttach,
}: {
  bookingId: string;
  document?: { type: string } | null;
  canAttach: boolean;
}) {
  const client = useQueryClient();
  const [type, setType] = useState('passport');
  const [attaching, setAttaching] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const view = async () => {
    const tab = window.open('', '_blank');
    if (tab) tab.opener = null;
    setError('');
    try {
      if (!tab) throw new Error('Allow pop-ups to view the ID');
      const blob = await apiBlob(
        adminPath(`/bookings/${bookingId}/id-document`),
      );
      if (!ID_FILE_TYPES.includes(blob.type)) {
        throw new Error('This file type can’t be opened here');
      }
      const url = URL.createObjectURL(blob);
      tab.location.href = url;
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      tab?.close();
      setError(err instanceof Error ? err.message : 'Could not view ID');
    }
  };
  const upload = async (input: HTMLInputElement) => {
    const file = input.files?.[0];
    // Cleared so choosing the same file again (e.g. after a failure) fires a change.
    input.value = '';
    if (!file) return;
    setError('');
    if (
      !ID_FILE_TYPES.includes(file.type) ||
      file.size > 10 * 1024 * 1024
    ) {
      setError('Choose a JPEG, PNG, WebP or PDF up to 10 MB');
      return;
    }
    setBusy(true);
    try {
      const body = new FormData();
      body.set('documentType', type);
      body.set('file', file);
      await apiClient(adminPath(`/bookings/${bookingId}/id-document`), {
        method: 'POST',
        body,
      });
      await client.invalidateQueries({ queryKey: queryKeys.bookings.all });
      setAttaching(false);
    } catch (err) {
      const [fieldMessage] = Object.values(apiFieldErrors(err));
      setError(
        fieldMessage ||
          (err instanceof Error ? err.message : 'Could not attach ID'),
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Box py="12px">
      <Flex gap="8px" align="center" wrap="wrap">
        <Text fontSize="14px">
          {document ? `ID: ${labels[document.type] ?? document.type}` : 'No ID'}
        </Text>
        {document && (
          <Button size="xs" variant="ghost" onClick={() => void view()}>
            View
          </Button>
        )}
        {canAttach && (
          <Button
            size="xs"
            variant="secondary"
            onClick={() => setAttaching(!attaching)}
          >
            {document ? 'Replace ID' : 'Attach ID'}
          </Button>
        )}
      </Flex>
      {attaching && (
        <Flex gap="8px" mt="8px" direction="column">
          <Select
            aria-label="ID document type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            isDisabled={busy}
          >
            {Object.entries(labels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Input
            type="file"
            aria-label="Attach ID file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            isDisabled={busy}
            onChange={(e) => void upload(e.target)}
          />
          <Text fontSize="12px">
            {busy
              ? 'Uploading…'
              : 'Photo or PDF, up to 10 MB. Kept privately and deleted 90 days after check-out.'}
          </Text>
        </Flex>
      )}
      {error && (
        <Text role="alert" color="red.500">
          {error}
        </Text>
      )}
    </Box>
  );
}
