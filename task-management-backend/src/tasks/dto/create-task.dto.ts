export class CreateTaskDto {
  title: string;
  description: string;
  deadline: Date;
  status: string;
  projectId: string; 
  assignedToId?: string;
  priority?: string;
}