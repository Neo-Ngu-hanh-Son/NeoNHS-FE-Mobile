import { memo } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Text } from "@/components/ui/text";

type ActionCardProps = {
  title: string;
  desc: string;
  onPress?: () => void;
  rightIcon?: React.ReactNode;
  themeCard: string;
  themeBorder: string;
  themeForeground: string;
  themeMutedForeground: string;
};

const ActionCard = memo(function ActionCard({
  title,
  desc,
  onPress,
  rightIcon,
  themeCard,
  themeBorder,
  themeForeground,
  themeMutedForeground,
}: ActionCardProps) {
  return (
    <TouchableOpacity
      style={[styles.actionCard, { backgroundColor: themeCard, borderColor: themeBorder }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}>
      <View style={styles.actionCardHeader}>
        <Text style={[styles.cardTitle, { color: themeForeground }]}>{title}</Text>
        {rightIcon || <Text className="text-xs font-medium text-primary">See all</Text>}
      </View>
      <Text style={[styles.cardDesc, { color: themeMutedForeground }]} numberOfLines={2}>
        {desc}
      </Text>
    </TouchableOpacity>
  );
});

export default ActionCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blueHeader: {
    height: 80,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainSheet: {
    flex: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden', // Đảm bảo nội dung không tràn khỏi bo góc
  },
  profileInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    // Đổ bóng nhẹ nhàng cho thẻ nằm trong
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    width: 160,
    overflow: 'hidden',
  },
  avatarBorder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(29, 161, 242, 0.2)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  starCircle: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 4,
    borderRadius: 20,
  },
  pointsLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  pointsValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24, // Thêm khoảng cách ở đỉnh để đẹp hơn
    gap: 12,
  },
  actionCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  actionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 10,
    paddingLeft: 4,
  },
  settingsSection: {
    marginTop: 10,
  },
  contentGuest: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  guestCard: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
  },
  kycCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  kycCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  kycIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});