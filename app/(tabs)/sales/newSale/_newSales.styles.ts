import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  content: { 
    padding: 20, 
  },
  contenedor: {
    position: 'relative',
    top:0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex:10,
    elevation:10,
  },
  inputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#007BFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  inputInvalid: {
    borderColor: '#E74C3C',
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  errorText: {
    color: '#E74C3C',
    marginBottom: 10,
  },
  addButton: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007BFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'transparent',
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 16,
    color: '#007BFF',
  },
  scrollView: {
    marginBottom: 10,
        height: 100
  },
  thumbWrapper: {
    position: 'relative',
    marginRight: 12,
    height: 100
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  modalImageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: '70%',
    justifyContent: 'center',
    alignItems: 'center',
    height: '80%'
  },
  modalImage: {
    width: '90%',
    height: '30%',
    borderRadius: 12,
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    color: '#003366',
    paddingVertical: 12,
  },
  message: {
    textAlign: 'center',
    paddingVertical: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
  },
  camera: {
    flex: 1,
  },
  deleteIcon: {
    position: 'absolute',
    top: -0.7,
    right: -2,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  nextButton: {
    height: 48,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#99CCFF',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cameraButtons: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'space-evenly',
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  camBtn: {
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    marginBlockEnd: 20
  },
  camBtnText: {
    fontSize: 16,
    color: 'white',
  },
  modalOverlay: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: '#fff',
  justifyContent: 'flex-end',
  zIndex: 100,
  elevation: 100,
  marginBlockEnd:48
  },
  modalContainer: {
    backgroundColor: 'rgb(244, 234, 234)',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderEndEndRadius:10,
    borderEndStartRadius: 10,
  },
  modalOption: {
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#fff'
  },
  modalOptionText: {
    fontSize: 18,
    color: '#007BFF',
    textAlign: 'center',
  },
  modalCancelar: {
    paddingVertical: 14,
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: '#fff',
  },
  modalCancelarText: {
    fontSize: 20,
    color: '#E74C3C',
    textAlign: 'center',
  },
  map: {
    width: '100%',
    height: 200, // o el alto que desees
    borderRadius: 15,
    marginBottom: 20,
  }
});