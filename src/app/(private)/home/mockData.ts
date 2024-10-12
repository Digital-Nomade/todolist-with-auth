import { Todo } from "@/types/Todo";

export const mockTodos: Todo[] = [
  {
    createdAt: new Date('11-10-2024'),
    description: '<p>I need to remember all of this to do not have problems with my wife</p><ul><li>5kg of peanuts</li><li>2kg of lemon</li><li>10 watermelon</li><li>11 pears</li></ul>',
    title: 'Buy Fruits',
    done: false,
    dueTo: new Date('12-10-2024'),
    reminderOn: null,
    id: '1938fff',
    updatedAt: new Date('11-10-2024'),
  },
  {
    createdAt: new Date('11-10-2024'),
    description: 'I need to remember to call Ellen to tell that I went to shopping for fruits.',
    title: 'Call Ellen',
    done: false,
    dueTo: new Date('12-10-2024'),
    reminderOn: null,
    id: '1928fff',
    updatedAt: new Date('11-10-2024'),
  },
  {
    createdAt: new Date('11-10-2024'),
    description: 'I need to remember to travel, cuz I`m getting tired',
    title: 'Travel',
    done: false,
    dueTo: new Date('12-10-2024'),
    reminderOn: null,
    id: '19398fff',
    updatedAt: new Date('11-10-2024'),
  }
]