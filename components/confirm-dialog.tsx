import React from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader, AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import {CircleFadingPlusIcon, Trash2Icon} from "lucide-react";

interface ConfirmProps {
    open: boolean
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    destructive?: boolean
    onConfirm: () => void
    onCancel: () => void
}

const ConfirmDialog = ({
                           open,
                           title,
                           description,
                           confirmText = "Continue",
                           cancelText = "Cancel",
                           destructive = false,
                           onConfirm,
                           onCancel,
                       }: ConfirmProps) => {
    return (
        <AlertDialog
            open={open}
            onOpenChange={(isOpen) => {
                // Fires on Escape key / outside click too, not just Cancel button
                if (!isOpen) onCancel()
            }}

        >
            <AlertDialogTrigger className={'hidden'}/>
            <AlertDialogContent size={'sm'} className={`${destructive ? ' text-destructive' : ""} `}>
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                        <Trash2Icon />
                    </AlertDialogMedia>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel} className={'cursor-pointer text-white'}>
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className={
                            destructive
                                ? "bg-destructive text-white hover:bg-destructive/90"
                                : undefined
                        }
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default ConfirmDialog