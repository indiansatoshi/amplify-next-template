"use client";
import { useState, useEffect } from "react";
import { generateClient } from "@aws-amplify/api";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import '@/app/lib/amplify';

interface Todo {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface ListTodosResponse {
  listTodos: {
    items: Todo[];
  };
}

interface CreateTodoResponse {
  createTodo: Todo;
}

interface DeleteTodoResponse {
  deleteTodo: {
    id: string;
  };
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoContent, setNewTodoContent] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuthenticator();

  useEffect(() => {
    listTodos();
  }, []);

  async function listTodos() {
    try {
      const response = await generateClient().graphql<ListTodosResponse>({
        query: `
          query ListTodos {
            listTodos {
              items {
                id
                content
                createdAt
                updatedAt
              }
            }
          }
        `,
        authMode: 'userPool'
      });
      
      if ('data' in response && response.data) {
        setTodos(response.data.listTodos.items);
      }
    } catch (error) {
      console.error('Error listing todos:', error);
    }
  }

  async function createTodo() {
    if (!newTodoContent.trim()) return;
    
    try {
      const response = await generateClient().graphql<CreateTodoResponse>({
        query: `
          mutation CreateTodo($input: CreateTodoInput!) {
            createTodo(input: $input) {
              id
              content
              createdAt
              updatedAt
            }
          }
        `,
        variables: {
          input: {
            content: newTodoContent
          }
        },
        authMode: 'userPool'
      });
      
      if ('data' in response && response.data) {
        setNewTodoContent("");
        setIsDialogOpen(false);
        listTodos(); // Refresh the list
      }
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  }

  async function deleteTodo(id: string) {
    try {
      const response = await generateClient().graphql<DeleteTodoResponse>({
        query: `
          mutation DeleteTodo($input: DeleteTodoInput!) {
            deleteTodo(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: { id }
        },
        authMode: 'userPool'
      });
      
      if ('data' in response && response.data) {
        listTodos(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Todo App</h1>
        
        <div className="mb-8">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add New Todo</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Todo</DialogTitle>
                <DialogDescription>
                  Create a new todo item. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <Input
                value={newTodoContent}
                onChange={(e) => setNewTodoContent(e.target.value)}
                placeholder="Enter todo content"
              />
              <DialogFooter>
                <Button onClick={createTodo}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {todos.map((todo) => (
            <Card key={todo.id}>
              <CardHeader>
                <CardTitle>{todo.content}</CardTitle>
                <CardDescription>Created at: {new Date(todo.createdAt).toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={() => deleteTodo(todo.id)}>
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}