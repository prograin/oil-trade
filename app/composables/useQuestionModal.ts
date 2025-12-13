// composables/useQuestionModal.ts
export const useQuestionModal = () => {
  const open = useState('questionModal:open', () => false)
  const title = useState('questionModal:title', () => '')
  const message = useState('questionModal:message', () => '')
  const confirmHandler = useState<null | (() => void)>('questionModal:confirm', () => null)

  function askQuestion(t: string, m: string, onConfirm: () => void) {
    title.value = t
    message.value = m
    confirmHandler.value = onConfirm
    open.value = true
  }

  function confirm() {
    if (confirmHandler.value) {
      confirmHandler.value()
    }
    close()
  }

  function close() {
    open.value = false
    confirmHandler.value = null
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
    askQuestion,
    confirm,
    close,
  }
}
