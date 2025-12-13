export const useSuccessModal = () => {
  // Global reactive state (shared across all pages/layouts)
  const open = useState('successModal:open', () => false)
  const title = useState('successModal:title', () => 'Success')
  const message = useState('successModal:message', () => '')

  function showSuccess(opts: { title?: string; message: string }) {
    title.value = opts.title ?? 'Success'
    message.value = opts.message
    open.value = true
  }

  function closeSuccess() {
    open.value = false
  }

  // Optional body scroll locking, same as error modal
  watch(open, (value) => {
    if (value) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
  })

  return {
    open,
    title,
    message,
    showSuccess,
    closeSuccess,
  }
}
