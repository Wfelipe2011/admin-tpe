import { useFormContext } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"
import { FormSectionWrapper } from "../ui/form-section-wrapper"
import { FormControl, FormField, FormItem } from "@/components/ui/form"
import type { PetitionFormValues } from "@/lib/schemas/petition-form-schema"

export function AvailabilitySection() {
  const form = useFormContext<PetitionFormValues>()

  const dayTranslations: Record<string, string> = {
    Monday: "Segunda-feira",
    Tuesday: "Terça-feira",
    Wednesday: "Quarta-feira",
    Thursday: "Quinta-feira",
    Friday: "Sexta-feira",
    Saturday: "Sábado",
    Sunday: "Domingo",
  }

  return (
    <FormSectionWrapper id="item-4" title="Disponibilidade">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 text-left">Dia</th>
              <th className="border p-2 text-center">Manhã</th>
              <th className="border p-2 text-center">Tarde</th>
              <th className="border p-2 text-center">Noite</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(form.getValues("availability") || {}).map(([day]) => (
              <tr key={day}>
                <td className="border p-2">{dayTranslations[day] || day}</td>
                <td className="border p-2 text-center">
                  <FormField
                    control={form.control}
                    name={`availability.${day}.morning` as any}
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-center space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </td>
                <td className="border p-2 text-center">
                  <FormField
                    control={form.control}
                    name={`availability.${day}.afternoon` as any}
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-center space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </td>
                <td className="border p-2 text-center">
                  <FormField
                    control={form.control}
                    name={`availability.${day}.evening` as any}
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-center space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FormSectionWrapper>
  )
}
