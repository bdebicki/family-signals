export const throwMsg = (msg: string, nested?: boolean) =>
  console.log(`${nested ? '└─ ' : ''}${msg}`)

export const throwError = (msg: string) => console.error(`${msg}`)
