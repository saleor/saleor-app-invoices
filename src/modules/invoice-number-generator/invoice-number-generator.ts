import {OrderFragment} from "../../../generated/graphql";

interface IInvoiceNumberGenerationStrategy {
    (order: OrderFragment): string;
}

export const InvoiceNumberGenerationStrategy = {
    localizedDate: (locale: string) => (order: Pick<OrderFragment, 'created'>) => {
        const orderCreatedDate = new Date(order.created);

        return Intl.DateTimeFormat(locale,).format(orderCreatedDate)
    }
} satisfies Record<string, (...args: any[]) => IInvoiceNumberGenerationStrategy>

export class InvoiceNumberGenerator {
    generateFromOrder(order: OrderFragment, strategy: InvoiceNumberGenerationStrategy): string {
        return strategy(order)
    }
}