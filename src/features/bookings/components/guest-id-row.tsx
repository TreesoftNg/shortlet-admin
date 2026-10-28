'use client';
import { useState } from 'react';
import { Box, Button, Flex, Input, Select, Text } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { apiBlob, apiClient } from '@/shared/api/client';
import { adminPath } from '@/shared/api/paths';
import { queryKeys } from '@/shared/api/query-keys';
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
      const blob = await apiBlob(
        adminPath(`/bookings/${bookingId}/id-document`),
      );
      const url = URL.createObjectURL(blob);
      if (tab) tab.location.href = url;
      else throw new Error('Allow pop-ups to view the ID');
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      tab?.close();
      setError(err instanceof Error ? err.message : 'Could not view ID');
    }
  };
  const upload = async (file?: File) => {
    if (!file) return;
    setError('');
    if (
      !['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(
        file.type,
      ) ||
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
      setError(err instanceof Error ? err.message : 'Could not attach ID');
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
            onChange={(e) => void upload(e.target.files?.[0])}
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
