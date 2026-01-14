import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Project } from '../../projects/schemas/project.schema';
import { User } from '../../users/schemas/user.schema';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  deadline: Date;

  @Prop({ default: 'medium' })
  priority: string;

  @Prop({ default: 'todo' })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Project', required: true })
  project: Project;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  assignedTo: User;
}

export const TaskSchema = SchemaFactory.createForClass(Task);