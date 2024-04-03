"use client";

import * as z from "zod";
import { use, useState, useTransition } from "react";
import { useFormStatus, useFormState } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { InferSelectModel } from "drizzle-orm";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { AlertModal } from "@/components/modals/alert-modal";
import { bookAuthor, chapter, subject } from "@/db/schema";
import db from "@/lib/db";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createChapter, deleteChapter, updateChapter } from "@/actions/chapter";
import { getBooksBySubject } from "@/actions/book";

const formSchema = z.object({
  name: z.string().min(1),
  subjectId: z.string().min(1),
  bookAuthorId: z.string().min(1),
});

type ChapterFormValues = z.infer<typeof formSchema>;
type Subject = InferSelectModel<typeof subject>;
type Chapter = InferSelectModel<typeof chapter> & {
  subject: {
    id: string;
    name: string;
  };
  book: {
    id: string;
    name: string;
  };
};
interface ChapterFormProps {
  initialData: {
    subjects: Subject[];
    books: InferSelectModel<typeof bookAuthor>[] | null;
    chapter: Chapter | null;
  };
}

export const ChapterForm: React.FC<ChapterFormProps> = ({
  initialData: { chapter: initialData, subjects, books = null },
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit chapter" : "Create chapter";
  const description = initialData ? "Edit a chapter." : "Add a new chapter";
  const toastMessage = initialData ? "Chapter updated." : "Chapter created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<ChapterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      subjectId: initialData?.subject.id ?? "",
      bookAuthorId: initialData?.book.id ?? "",
    },
  });

  const onSubmit = async ({ subjectId, ...data }: ChapterFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await updateChapter(initialData.id, data);
        router.refresh();
      } else {
        const result = await createChapter(data);
        router.push(`/admin/chapters/${result.id}`);
      }
      toast.success(toastMessage);
    } catch (error: any) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      if (typeof params.chapterId === "string")
        await deleteChapter(params.chapterId as string);
      router.push(`/admin/chapters`);
      toast.success("Chapter deleted.");
    } catch (error: any) {
      toast.error(
        "Make sure you removed all products using this chapter first."
      );
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const [booksBySubject, getBooksAction] = useFormState(
    getBooksBySubject,
    books
  );

  console.log({ booksBySubject });

  return (
    <>
      {initialData && (
        <AlertModal
          isOpen={open}
          onClose={() => setOpen(false)}
          onConfirm={onDelete}
          loading={loading}
        />
      )}
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-y-8 max-w-lg mx-auto"
        >
          <div className="flex flex-col items-stretch gap-y-4">
            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        getBooksAction(value);
                      }}
                      value={field.value}
                      disabled={field.disabled}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bookAuthorId"
              disabled={!booksBySubject}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Book/Author</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={field.disabled}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a book" />
                      </SelectTrigger>
                      <SelectContent>
                        {booksBySubject?.map((book) => (
                          <SelectItem key={book.id} value={book.id}>
                            {book.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Chapter name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
