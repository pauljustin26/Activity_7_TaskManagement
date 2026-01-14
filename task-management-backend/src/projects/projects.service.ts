import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private projectModel: Model<Project>) {}

  create(createProjectDto: CreateProjectDto) {
    const createdProject = new this.projectModel(createProjectDto);
    return createdProject.save();
  }

  async findAll(userId?: string, role?: string) {
    if (role === 'admin') {
      return this.projectModel.find()
        .populate('manager')
        .populate('members')
        .exec();
    } 
    
    if (role === 'project_manager') {
      // Cast to 'any' to bypass strict type check on ID
      return this.projectModel.find({ manager: userId as any })
        .populate('manager')
        .populate('members')
        .exec();
    }

    if (userId) {
       return this.projectModel.find({ members: userId as any })
        .populate('manager')
        .populate('members')
        .exec();
    }

    return this.projectModel.find().exec();
  }

  findOne(id: string) {
    return this.projectModel.findById(id)
      .populate('manager')
      .populate('members')
      .exec();
  }

  async addMember(projectId: string, userId: string) {
    return this.projectModel.findByIdAndUpdate(
      projectId,
      { $addToSet: { members: userId } },
      { new: true }
    ).populate('manager').populate('members').exec();
  }

  update(id: string, updateProjectDto: UpdateProjectDto) {
    return this.projectModel.findByIdAndUpdate(id, updateProjectDto, { new: true }).exec();
  }

  remove(id: string) {
    return this.projectModel.findByIdAndDelete(id).exec();
  }
}