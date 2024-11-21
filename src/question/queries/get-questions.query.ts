export class GetQuestionsQuery {
  constructor(
    public readonly label: string,
    public readonly orderBy: 'ASC' | 'DESC' = 'ASC',
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {}
}
