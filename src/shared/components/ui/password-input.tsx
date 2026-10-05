'use client';

import {
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  type InputProps,
} from '@chakra-ui/react';
import { useState } from 'react';
import { LuEye, LuEyeOff } from 'react-icons/lu';

export type PasswordInputProps = Omit<InputProps, 'type'>;

/** Password field with a show/hide eye control. */
export function PasswordInput({
  h = '44px',
  pr,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <InputGroup>
      <Input
        type={visible ? 'text' : 'password'}
        h={h}
        pr={pr ?? '44px'}
        {...props}
      />
      <InputRightElement h={h} w="44px">
        <IconButton
          aria-label={visible ? 'Hide password' : 'Show password'}
          icon={visible ? <LuEyeOff size={16} /> : <LuEye size={16} />}
          variant="ghost"
          size="sm"
          h="32px"
          minW="32px"
          borderRadius="8px"
          color="ink.300"
          tabIndex={-1}
          type="button"
          onClick={() => setVisible((current) => !current)}
        />
      </InputRightElement>
    </InputGroup>
  );
}
