import * as React from "react";

declare const Button: React.ForwardRefExoticComponent<
  React.ButtonHTMLAttributes<HTMLButtonElement> & 
  { variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"; 
    size?: "default" | "sm" | "lg" | "icon"; } & 
  React.RefAttributes<HTMLButtonElement>
>;

declare const buttonVariants: (props: { 
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string 
}) => string;

export { Button, buttonVariants }; 