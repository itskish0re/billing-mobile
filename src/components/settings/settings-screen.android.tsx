import {
  Button,
  Column,
  Icon,
  ListItem,
  OutlinedCard,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import {
  clickable,
  fillMaxWidth,
  padding,
} from '@expo/ui/jetpack-compose/modifiers';
import { useRouter } from 'expo-router';

import { FinancialYearPicker } from '@/components/settings/financial-year-picker';
import { useAuth } from '@/providers/auth-provider';

const CHEVRON_RIGHT_ICON = require('@/assets/icons/chevron_right.xml');
const PERSON_ICON = require('@/assets/icons/person.xml');

export function SettingsScreen() {
  const router = useRouter();
  const colors = useMaterialColors();
  const { profile, signOut } = useAuth();
  const displayName = profile?.full_name?.trim() || 'Not set';

  return (
    <Column
      modifiers={[fillMaxWidth()]}
      verticalArrangement={{ spacedBy: 20 }}>
      <Column verticalArrangement={{ spacedBy: 8 }}>
        <Text color={colors.primary} style={{ typography: 'titleSmall' }}>
          Account
        </Text>

        <OutlinedCard modifiers={[fillMaxWidth()]}>
          <ListItem
            colors={{ containerColor: 'transparent' }}
            modifiers={[
              clickable(() => {
                router.push('/settings/update-name');
              }),
            ]}>
            <ListItem.LeadingContent>
              <Icon source={PERSON_ICON} size={24} tint={colors.primary} />
            </ListItem.LeadingContent>
            <ListItem.HeadlineContent>
              <Text style={{ typography: 'titleMedium' }}>Update name</Text>
            </ListItem.HeadlineContent>
            <ListItem.SupportingContent>
              <Text color={colors.onSurfaceVariant} style={{ typography: 'bodyMedium' }}>
                {displayName}
              </Text>
            </ListItem.SupportingContent>
            <ListItem.TrailingContent>
              <Icon source={CHEVRON_RIGHT_ICON} size={24} tint={colors.onSurfaceVariant} />
            </ListItem.TrailingContent>
          </ListItem>
        </OutlinedCard>
      </Column>

      <Column verticalArrangement={{ spacedBy: 8 }}>
        <Text color={colors.primary} style={{ typography: 'titleSmall' }}>
          Financial year
        </Text>

        <OutlinedCard modifiers={[fillMaxWidth()]}>
          <Column
            modifiers={[fillMaxWidth(), padding(16, 16, 16, 16)]}
            verticalArrangement={{ spacedBy: 12 }}>
            <Column horizontalAlignment="start" verticalArrangement={{ spacedBy: 4 }}>
              <Text style={{ typography: 'titleMedium' }}>Change financial year</Text>
              <Text color={colors.onSurfaceVariant} style={{ typography: 'bodyMedium' }}>
                Select the active financial year for billing
              </Text>
            </Column>

            <FinancialYearPicker />
          </Column>
        </OutlinedCard>
      </Column>

      <Button
        onClick={() => {
          void signOut();
        }}>
        <Text color={colors.onPrimary}>Sign out</Text>
      </Button>
    </Column>
  );
}
