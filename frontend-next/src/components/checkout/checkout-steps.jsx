import { Check, MapPin, CreditCard, ShoppingBag } from "lucide-react";
import { Fragment } from "react";

const STEPS = [
  { id: 1, title: "Shipping", icon: MapPin },
  { id: 2, title: "Payment", icon: CreditCard },
  { id: 3, title: "Success", icon: ShoppingBag },
];

export function CheckoutSteps({ active }) {
  return (
    <div className="flex w-full justify-center px-3 py-5">
      <div className="flex w-full max-w-4xl items-center justify-between">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <Fragment key={step.id}>
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={`flex size-10 items-center justify-center rounded-full border-2 transition-all duration-300 sm:size-12 ${
                    active >= step.id ? "border-brand bg-brand text-white" : "border-border bg-surface text-muted"
                  }`}
                >
                  {active > step.id ? <Check className="size-5" /> : <Icon className="size-[18px]" />}
                </div>
                <span
                  className={`mt-2 text-center text-xs font-medium sm:text-sm ${
                    active >= step.id ? "text-brand" : "text-muted"
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index !== STEPS.length - 1 && (
                <div
                  className={`mx-2 h-[3px] flex-1 rounded-full transition-all duration-300 sm:mx-4 ${
                    active > step.id ? "bg-brand" : "bg-border"
                  }`}
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
