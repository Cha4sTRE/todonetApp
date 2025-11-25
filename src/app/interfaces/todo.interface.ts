export interface TodoInterface{
  id?: number;
  title?: string;
  description?: string;
  status?: boolean;
  date?: string;
}
export interface TaskStatus {
  key: string;
  name: string;
  color: string;
  completed: boolean;
}
