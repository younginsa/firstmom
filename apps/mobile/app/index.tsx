import { StyleSheet, Text, View } from 'react-native';

// M0 placeholder splash. Real splash design (mockup screen 1) lands in M1.
export default function Splash() {
  return (
    <View style={styles.container}>
      <View style={styles.mark} />
      <Text style={styles.wordmark}>FIRSTMOM</Text>
      <Text style={styles.tagline}>처음이라 서툴지만, 천천히 같이해나가요</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F1E4',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  mark: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D97757',
    marginBottom: 24,
  },
  wordmark: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.5,
    color: '#5C5141',
    marginBottom: 16,
  },
  tagline: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '600',
    color: '#2B2418',
  },
});
