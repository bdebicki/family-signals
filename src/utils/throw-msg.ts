export const throwMsg = (msg: string, nested?: boolean) =>
  console.log(`${nested ? '└─ ' : ''}${msg}`)
