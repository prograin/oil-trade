export const useErrorModal = () => {
  // Global reactive state (shared across all pages/layouts)
  const open = useState('errorModal:open', () => false)
  const title = useState('errorModal:title', () => '')
  const message = useState('errorModal:message', () => '')

  function showError(opts: { title?: string; message: string }) {
    title.value = opts.title ?? 'Error'
    message.value = opts.message
    open.value = true
  }

  function closeError() {
    open.value = false
  }

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
    showError,
    closeError,
  }
}
