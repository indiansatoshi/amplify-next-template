"use client";
import { useState, useEffect } from "react";
import { generateClient, GraphQLResult } from "@aws-amplify/api";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

Amplify.configure(outputs);

const client = generateClient();

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
      const response = await client.graphql<GraphQLResult<ListTodosResponse>>({
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
      const response = await client.graphql<GraphQLResult<CreateTodoResponse>>({
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
      const response = await client.graphql<GraphQLResult<DeleteTodoResponse>>({
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
    <Card>
      <CardHeader>
        <CardTitle>My Todos</CardTitle>
        <CardDescription>
          Manage your todos and stay organized
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">Add New Todo</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Todo</DialogTitle>
                <DialogDescription>
                  Add a new todo item to your list
                </DialogDescription>
              </DialogHeader>
              <Input
                value={newTodoContent}
                onChange={(e) => setNewTodoContent(e.target.value)}
                placeholder="Enter todo content..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    createTodo();
                  }
                }}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createTodo}>Create Todo</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="space-y-2">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <span>{todo.content}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteTodo(todo.id)}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>

          {todos.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              No todos yet. Create one to get started!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}