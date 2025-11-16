import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundImage: {
    position: 'absolute',
    top: '45%',
    left: '25%',
    width: 500,
    height: 500,
    zIndex: 0,
    opacity: 0.65,
  },
  header: {
    justifyContent: 'space-between',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    height: '10%',
    width: '100%',
    backgroundColor: '#012FA7',
    paddingHorizontal: '8%',
    paddingTop: 5,
  },
  backButton: {
    marginRight: 10,
  },
  backButtonText: {
    marginTop: 20,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerText: {
    marginTop: 20,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchInput: {
    color: '#012FA7',
    width: '85%',
    alignSelf: 'center',
    height: 50,
    marginTop: 50,
    marginBottom: 50,
    backgroundColor: '#CCD5ED',
    paddingHorizontal: 16,
    borderRadius: 10,
    fontSize: 16,
  },
  content: {
    alignSelf: 'center',
    width: '85%',
    flex: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 10,
  },
});
