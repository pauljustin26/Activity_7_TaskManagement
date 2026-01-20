import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  NotFoundException // 1. Import this exception
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  async findAll(@Query('userId') userId?: string, @Query('role') role?: string) {
    // 2. Await the result so we can check it
    const projects = await this.projectsService.findAll(userId, role);

    // 3. Check if the array is null or empty
    if (!projects || projects.length === 0) {
      throw new NotFoundException('No projects found matching your criteria.');
    }
    
    return projects;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const project = await this.projectsService.findOne(id);

    // 4. Check if the specific item exists
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  @Patch(':id/members')
  async addMember(@Param('id') id: string, @Body('userId') userId: string) {
    try {
      const updatedProject = await this.projectsService.addMember(id, userId);
      if (!updatedProject) throw new NotFoundException();
      return updatedProject;
    } catch (error) {
      // Catch errors if the project ID doesn't exist
      throw new NotFoundException(`Cannot add member. Project ${id} not found.`);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    try {
      const updatedProject = await this.projectsService.update(id, updateProjectDto);
      if (!updatedProject) throw new NotFoundException();
      return updatedProject;
    } catch (error) {
      throw new NotFoundException(`Cannot update. Project ${id} not found.`);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const result = await this.projectsService.remove(id);
      if (!result) throw new NotFoundException();
      return result;
    } catch (error) {
      throw new NotFoundException(`Cannot delete. Project ${id} not found.`);
    }
  }
}