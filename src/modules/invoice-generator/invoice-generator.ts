import {Order} from "../../../generated/graphql";

export interface InvoiceGenerator {
    generate(order: Order): Promise<void>
}