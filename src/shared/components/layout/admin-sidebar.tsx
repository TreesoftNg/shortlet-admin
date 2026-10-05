'use client';

import {
  Box,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Flex,
  IconButton,
  Text,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import {
  LuBuilding2,
  LuCalendarCheck,
  LuCalendarDays,
  LuChartBar,
  LuDoorOpen,
  LuLayoutDashboard,
  LuLogOut,
  LuRefreshCw,
  LuSettings,
  LuStar,
  LuUserCog,
  LuUsers,
  LuWallet,
} from 'react-icons/lu';
import type { IconType } from 'react-icons';
import { useLogout, useMe } from '@/features/auth/hooks/use-auth';
import { displayName, initials } from '@/features/auth/utils/auth-helpers';
import { useUiStore } from '@/shared/store/ui-store';
import { SunmadeLogo } from '@/shared/components/brand';

type NavItem = {
  label: string;
  href: string;
  icon: IconType;
  count?: number;
  /** Still backed by local mock data, not the live API. */
  demo?: boolean;
};

type NavSection = {
  title?: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', href: '/', icon: LuLayoutDashboard, demo: true },
      { label: 'Bookings', href: '/bookings', icon: LuCalendarCheck },
      { label: 'Availability', href: '/availability', icon: LuCalendarDays, demo: true },
      { label: 'Properties', href: '/properties', icon: LuBuilding2 },
      { label: 'Units', href: '/units', icon: LuDoorOpen },
      { label: 'Calendar sync', href: '/calendar-sync', icon: LuRefreshCw },
    ],
  },
  {
    title: 'Guests',
    items: [
      { label: 'Customers', href: '/customers', icon: LuUsers },
      { label: 'Reviews', href: '/reviews', icon: LuStar },
    ],
  },
  {
    title: 'Finance',
    items: [
      { label: 'Payments', href: '/payments', icon: LuWallet },
      { label: 'Reports', href: '/reports', icon: LuChartBar, demo: true },
    ],
  },
  {
    title: 'Business',
    items: [
      { label: 'Staff', href: '/staff', icon: LuUserCog },
      { label: 'Settings', href: '/settings', icon: LuSettings },
    ],
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: profile } = useMe();
  const signOut = useLogout();

  return (
    <Flex
      direction="column"
      h="100%"
      bg="white"
      py="24px"
      px="16px"
      gap="4px"
    >
      <Flex align="center" gap="10px" px="10px" pb="22px">
        <SunmadeLogo size="18px" tagline={false} />
      </Flex>

      {navSections.map((section) => (
        <Box key={section.title ?? 'main'}>
          {section.title ? (
            <Text
              fontSize="11px"
              fontWeight={700}
              color="ink.300"
              textTransform="uppercase"
              letterSpacing="0.06em"
              px="12px"
              pt="16px"
              pb="6px"
            >
              {section.title}
            </Text>
          ) : null}

          <VStack align="stretch" spacing="4px">
            {section.items.map((item) => {
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Flex
                  key={item.href}
                  as={Link}
                  href={item.href}
                  align="center"
                  gap="12px"
                  px="12px"
                  py="10px"
                  borderRadius="10px"
                  fontSize="14px"
                  fontWeight={600}
                  color={active ? 'brand.600' : 'ink.400'}
                  bg={active ? 'brand.50' : 'transparent'}
                  _hover={{ bg: active ? 'brand.50' : 'bg.400' }}
                  onClick={onNavigate}
                >
                  <Icon size={18} />
                  <Text as="span" noOfLines={1}>
                    {item.label}
                    {item.demo ? (
                      <Text
                        as="span"
                        fontSize="11px"
                        fontWeight={600}
                        color="ink.300"
                      >
                        {' '}
                        (Demo)
                      </Text>
                    ) : null}
                  </Text>
                  {typeof item.count === 'number' ? (
                    <Box
                      as="span"
                      ml="auto"
                      bg="brand.500"
                      color="white"
                      fontSize="11px"
                      borderRadius="full"
                      px="8px"
                      py="1px"
                    >
                      {item.count}
                    </Box>
                  ) : null}
                </Flex>
              );
            })}
          </VStack>
        </Box>
      ))}

      <Flex
        mt="auto"
        gap="12px"
        align="center"
        px="10px"
        py="14px"
        borderTop="1px solid"
        borderColor="line.500"
      >
        <Flex
          w="32px"
          h="32px"
          flexShrink={0}
          borderRadius="full"
          align="center"
          justify="center"
          bg="brand.500"
          color="white"
          fontSize="12px"
          fontWeight={700}
          aria-hidden
        >
          {profile ? initials(profile) : ''}
        </Flex>
        <Box fontSize="13px" minW={0}>
          <Text fontWeight={700} noOfLines={1}>
            {profile ? displayName(profile) : 'Admin'}
          </Text>
          <Text color="ink.300" noOfLines={1}>
            {profile?.role.name ?? ''}
          </Text>
        </Box>
        <IconButton
          ml="auto"
          size="sm"
          variant="ghost"
          aria-label="Sign out"
          icon={<LuLogOut size={16} />}
          isLoading={signOut.isPending}
          onClick={() => signOut.mutate()}
        />
      </Flex>
    </Flex>
  );
}

export function AdminSidebar() {
  const isMobileNavOpen = useUiStore((state) => state.isMobileNavOpen);
  const closeMobileNav = useUiStore((state) => state.closeMobileNav);
  const isDesktop = useBreakpointValue({ base: false, lg: true });

  useEffect(() => {
    if (isDesktop) {
      closeMobileNav();
    }
  }, [closeMobileNav, isDesktop]);

  return (
    <>
      <Box
        as="aside"
        display={{ base: 'none', lg: 'block' }}
        w="var(--sidebar-width)"
        minH="100vh"
        borderRight="1px solid"
        borderColor="line.500"
        flexShrink={0}
        position="sticky"
        top={0}
        h="100vh"
        overflowY="auto"
      >
        <SidebarContent />
      </Box>

      <Drawer
        isOpen={isMobileNavOpen}
        placement="left"
        onClose={closeMobileNav}
        size="xs"
      >
        <DrawerOverlay />
        <DrawerContent maxW="260px">
          <DrawerBody p={0}>
            <SidebarContent onNavigate={closeMobileNav} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
