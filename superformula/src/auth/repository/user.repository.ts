import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { DBService } from 'src/db/db.service';

@Injectable()
export class UserRepository {
  constructor(private dbService: DBService) {}

  async create(user: any) {
    try {
      const newUser = await this.dbService.user.create({ data: user });

      return newUser;
    } catch (error) {
      console.error("error: ", error);
    }
  }

  async getUserByName(username: string): Promise<User> {
    const existingUser = await this.dbService.user.findFirst({
      where: { name: username },
    });

    return existingUser;
  }

  async get(userId: number): Promise<User> {
    const user = await this.dbService.user.findUnique({
      where: {
        id: userId,
      },
    });

    return user;
  }

  async update(userId: number, data: any): Promise<User> {
    const updatedUser = await this.dbService.user.update({
      where: {
        id: userId,
      },
      data: data,
    });

    if (updatedUser === null) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `User by the id ${userId} does not exists in our records`,
      });
    }

    return updatedUser;
  }

  async delete(userId: number) {
    try {
      const deleteUser = await this.dbService.user.delete({
        where: {
          id: userId,
        },
      });

      return deleteUser;
    } catch (error) {}
  }
}
