import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCourseDto } from './dto/create-course.dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto/update-course.dto';
import { Course } from './entities/course.entity';
import { Tag } from './entities/tag.entity';

@Injectable()
export class CourseService {
  @InjectRepository(Course)
  private readonly courseRepository: Repository<Course>;

  @InjectRepository(Tag)
  private readonly tagRepository: Repository<Tag>;

  findAll() {
    return this.courseRepository.find({
      relations: ['tags'],
    });
  }

  findOne(id: string) {
    const course = this.courseRepository.findOne(id, { relations: ['tags'] });
    if (!course) {
      throw new NotFoundException(`Course ${id} not found`);
    }
    return course;
  }

  async create(createCourseDTO: CreateCourseDto) {
    const tags = await Promise.all(
      createCourseDTO.tags.map((name: string) => this.preloadTagByName(name)),
    );

    const course = this.courseRepository.create({ ...createCourseDTO, tags });
    return this.courseRepository.save(course);
  }

  async update(id: string, updateCourseDTO: UpdateCourseDto) {
    const tags =
      updateCourseDTO.tags &&
      (await Promise.all(
        updateCourseDTO.tags.map((name) => this.preloadTagByName(name)),
      ));

    const course = await this.courseRepository.preload({
      id: +id,
      ...updateCourseDTO,
      tags,
    });
    if (!course) {
      throw new NotFoundException(`Course ${id} not found`);
    }
    return this.courseRepository.save(course);
  }

  async remove(id: string) {
    const course = await this.courseRepository.findOne(id);
    if (!course) {
      throw new NotFoundException(`Course ${id} not found`);
    }
    return this.courseRepository.remove(course);
  }

  private async preloadTagByName(name: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne(name);

    if (tag) {
      return tag;
    }

    return this.tagRepository.create({ name });
  }
}
