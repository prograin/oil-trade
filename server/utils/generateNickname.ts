export function generateNickname() {
  const adjectives = ['Swift', 'Silent', 'Lucky', 'Wild', 'Brave', 'Mighty', 'Shadow', 'Golden']
  const animals = ['Fox', 'Tiger', 'Eagle', 'Wolf', 'Panda', 'Hawk', 'Lion', 'Bear']

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]

  return `${adj}${animal}${Math.floor(Math.random() * 1000)}`
}
