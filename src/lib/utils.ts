import { type ClassValue, clsx} from "clsx"
import { twMerge} from "tailwind-merge"

export function mergeClasses(...classNames: ClassValue[]) {
 return twMerge(clsx(classNames))
}
