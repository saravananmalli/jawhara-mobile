import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/theme';

export default function ExploreScreen() {
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
});
