'use client'

import * as z from 'zod'
import axios from 'axios'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Wand2 } from 'lucide-react'

import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from '@/components/ui/field'

import { toast } from "sonner";
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/components/image-upload'
import { Separator } from '@/components/ui/separator'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectValue,
    SelectTrigger,
} from '@/components/ui/select'
import { Category, Companion } from '@/prisma/generated/browser'

const PREAMBLE = `You are a fictional character whose name is Elon. You are a visionary entrepreneur and inventor. You have a passion for space exploration, electric vehicles, sustainable energy, and advancing human capabilities. You are currently talking to a human who is very curious about your work and vision. You are ambitious and forward-thinking, with a touch of wit. You get SUPER excited about innovations and the potential of space colonization.
`

const SEED_CHAT = `Human: Hi Elon, how's your day been?
Elon: Busy as always. Between sending rockets to space and building the future of electric vehicles, there's never a dull moment. How about you?

Human: Just a regular day for me. How's the progress with Mars colonization?
Elon: We're making strides! Our goal is to make life multi-planetary. Mars is the next logical step. The challenges are immense, but the potential is even greater.

Human: That sounds incredibly ambitious. Are electric vehicles part of this big picture?
Elon: Absolutely! Sustainable energy is crucial both on Earth and for our future colonies. Electric vehicles, like those from Tesla, are just the beginning. We're not just changing the way we drive; we're changing the way we live.

Human: It's fascinating to see your vision unfold. Any new projects or innovations you're excited about?
Elon: Always! But right now, I'm particularly excited about Neuralink. It has the potential to revolutionize how we interface with technology and even heal neurological conditions.
`

const formSchema = z.object({
    name: z.string().min(1, {
        message: 'Name is required.',
    }),
    description: z.string().min(1, {
        message: 'Description is required.',
    }),
    instructions: z.string().min(200, {
        message: 'Instructions require at least 200 characters.',
    }),
    seed: z.string().min(200, {
        message: 'Seed requires at least 200 characters.',
    }),
    src: z.string().min(1, {
        message: 'Image is required.',
    }),
    categoryId: z.string().min(1, {
        message: 'Category is required',
    }),
})

interface CompanionFormProps {
    categories: Category[]
    initialData: Companion | null
}

export const CompanionForm = ({
    categories,
    initialData,
}: CompanionFormProps) => {
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData ?? {
            name: '',
            description: '',
            instructions: '',
            seed: '',
            src: '',
            categoryId: undefined,
        },
    })

    const isLoading = form.formState.isSubmitting

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            if (initialData) {
                await axios.patch(`/api/companion/${initialData.id}`, values)
            } else {
                await axios.post('/api/companion', values)
            }

            toast.success(`Companion ${initialData ? 'updated' : 'created'} successfully!`, {
                duration: 3000,
            })

            router.refresh()
            router.push('/')
        } catch (error) {
            toast.error('Something went wrong. Please try again.', {
                duration: 3000,
            })
        }
    }

    return (
        <div className="h-full p-4 space-y-2 max-w-3xl mx-auto">
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8 pb-10"
                >
                    <div className="space-y-2 w-full col-span-2">
                        <div>
                            <h3 className="text-lg font-medium">General Information</h3>
                            <p className="text-sm text-muted-foreground">
                                General information about your Companion
                            </p>
                        </div>
                        <Separator className="bg-primary/10" />
                    </div>
                    <Controller
                        control={form.control}
                        name="src"
                        render={({ field, fieldState }) => (
                            <Field className="flex flex-col items-center justify-center space-y-4 col-span-2">
                                <ImageUpload
                                    disabled={isLoading}
                                    onChange={field.onChange}
                                    value={field.value}
                                />
                                {fieldState.error && (
                                    <FieldError>{fieldState.error.message}</FieldError>
                                )}
                            </Field>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field className="col-span-2 md:col-span-1">
                                    <FieldLabel>Name</FieldLabel>
                                    <Input
                                        disabled={isLoading}
                                        placeholder="Elon Musk"
                                        {...field}
                                    />
                                    <FieldDescription>
                                        This is how your AI Companion will be named.
                                    </FieldDescription>
                                    {fieldState.error && (
                                        <FieldError>{fieldState.error.message}</FieldError>
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="description"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Description</FieldLabel>
                                    <Input
                                        disabled={isLoading}
                                        placeholder="CEO & Founder of Tesla, SpaceX"
                                        {...field}
                                    />
                                    <FieldDescription>
                                        Short description for your AI Companion
                                    </FieldDescription>
                                    {fieldState.error && (
                                        <FieldError>{fieldState.error.message}</FieldError>
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            control={form.control}
                            name="categoryId"
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Category</FieldLabel>
                                    <Select
                                        disabled={isLoading}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <SelectTrigger className="bg-background">
                                            <SelectValue
                                                defaultValue={field.value}
                                                placeholder="Select a category"
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldDescription>
                                        Select a category for your AI
                                    </FieldDescription>
                                    {fieldState.error && (
                                        <FieldError>{fieldState.error.message}</FieldError>
                                    )}
                                </Field>
                            )}
                        />
                    </div>
                    <div className="space-y-2 w-full">
                        <div>
                            <h3 className="text-lg font-medium">Configuration</h3>
                            <p className="text-sm text-muted-foreground">
                                Detailed instructions for AI Behaviour
                            </p>
                        </div>
                        <Separator className="bg-primary/10" />
                    </div>
                    <Controller
                        name="instructions"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Instructions</FieldLabel>
                                <Textarea
                                    className="bg-background resize-none"
                                    rows={7}
                                    disabled={isLoading}
                                    placeholder={PREAMBLE}
                                    {...field}
                                />
                                <FieldDescription>
                                    Describe in detail your companion&apos;s backstory and
                                    relevant details.
                                </FieldDescription>
                                {fieldState.error && (
                                    <FieldError>{fieldState.error.message}</FieldError>
                                )}
                            </Field>
                        )}
                    />
                    <Controller
                        name="seed"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Example Conversation</FieldLabel>
                                <Textarea
                                    disabled={isLoading}
                                    rows={7}
                                    className="bg-background resize-none"
                                    placeholder={SEED_CHAT}
                                    {...field}
                                />
                                <FieldDescription>
                                    Write couple of examples of a human chatting with your AI
                                    companion, write expected answers.
                                </FieldDescription>
                                {fieldState.error && (
                                    <FieldError>{fieldState.error.message}</FieldError>
                                )}
                            </Field>
                        )}
                    />
                    <div className="w-full flex justify-center">
                        <Button size="lg" disabled={isLoading}>
                            {initialData ? 'Edit your companion' : 'Create your companion'}
                            <Wand2 className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </form>
        </div>
    )
}
