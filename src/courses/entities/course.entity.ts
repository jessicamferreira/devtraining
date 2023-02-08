/* eslint-disable prettier/prettier */
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tag } from './tag.entity';
import {v4} from 'uuid';
@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @JoinTable({ name: 'courses_tags' })
  @ManyToMany(() => Tag, (tag) => tag.courses, {
    cascade: true,
  })
  tags: Tag[];
  
  @CreateDateColumn({ type: 'timestamp'})
  created_at: Date;

  @BeforeInsert()
  generatedId() {
    if(this.id) {
      return;
    }

    this.id = v4()
  }
}
