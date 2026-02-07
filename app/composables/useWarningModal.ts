export const useWarningModal = () => {
  // Global reactive state (shared across all pages/layouts)
  const open = useState('warningModal:open', () => false)
  const title = useState('warningModal:title', () => '')
  const message = useState('warningModal:message', () => '')

  function showWarning(opts: { title?: string; message: string }) {
    title.value = opts.title ?? 'Warning'
    message.value = opts.message
    open.value = true
  }

  function closeWarning() {
    open.value = false
  }

  const didLockBody = ref(false)

  watch(open, (value) => {
    if (value) {
      // only lock if not already locked
      if (!document.body.classList.contains('overflow-hidden')) {
        document.body.classList.add('overflow-hidden')
        didLockBody.value = true
      } else {
        didLockBody.value = false
      }
    } else {
      // only unlock if we locked it
      if (didLockBody.value) {
        document.body.classList.remove('overflow-hidden')
        didLockBody.value = false
      }
    }
  })

  return {
    open,
    title,
    message,
    showWarning,
    closeWarning,
  }
}
