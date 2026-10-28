import { Button } from '@chakra-ui/react';
import { LuExternalLink } from 'react-icons/lu';
import { canBlockInHospitable } from '@/shared/utils/hospitable-url';
export function HospitableButton({
  url,
  status,
}: {
  url?: string | null;
  status?: string;
}) {
  if (!canBlockInHospitable(url, status)) return null;
  return (
    <Button
      as="a"
      href={url!}
      target="_blank"
      rel="noopener noreferrer"
      variant="secondary"
      size="sm"
      leftIcon={<LuExternalLink />}
      onClick={(event) => event.stopPropagation()}
    >
      Block in Hospitable
    </Button>
  );
}
