import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  create(createTaskDto: CreateTaskDto) {
    const { projectId, assignedToId, ...taskData } = createTaskDto;
    
    const newTask = new this.taskModel({
      ...taskData,
      project: projectId,
      assignedTo: assignedToId,
    });
    return newTask.save();
  }

  findAll() {
    return this.taskModel
      .find()
      .populate('project')
      .populate('assignedTo')
      .exec();
  }

  findByProject(projectId: string) {
    return this.taskModel
      .find({ project: projectId } as any)
      .populate('assignedTo')
      .exec();
  }

  findOne(id: string) {
    return this.taskModel
      .findById(id)
      .populate('project')
      .populate('assignedTo')
      .exec();
  }

  update(id: string, updateTaskDto: UpdateTaskDto) {
    return this.taskModel.findByIdAndUpdate(id, updateTaskDto, { new: true }).exec();
  }

  remove(id: string) {
    return this.taskModel.findByIdAndDelete(id).exec();
  }
}