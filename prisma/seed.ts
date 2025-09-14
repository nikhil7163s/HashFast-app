import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    let userId = "cmcq08j7h0000dp4ofgfpwg4n";

    //       description      String
    //   accountId        String
    //   amount           Decimal @db.Decimal(15,2)
    //   memo             String?
    //   expires          DateTime?
    //   maxPayments      Int?
    //   authorId         String

    // create a dummy link
    // const link1 = await prisma.link.create({
    //     data: {
    //         description: "Two scoops of ice cream",
    //         accountId: "0.0.123456",
    //         amount: "4", // decimal
    //         currency: "USDC",
    //         authorId: userId,
    //     },
    // });

    // const link2 = await prisma.link.create({
    //     data: {
    //         description: "Pay this week!",
    //         accountId: "0.0.123456",
    //         amount: "100",
    //         currency: "HBAR",
    //         maxPayments: 20,
    //         expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    //         authorId: userId,
    //     },
    // });

    let link3 = await prisma.link.create({
        data: {
            description: "Pay last week!",
            accountId: "0.0.123456",
            amount: "3",
            currency: "HBAR",
            maxPayments: 20,
            expires: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
            authorId: userId,
        },
    });

    // let link1id = "cmcq0pkit00014lqu7rgkhmv6";

    // const payment1 = await prisma.payment.create({
    //     data: {
    //         transactionId: "0.0.4505361@1751874971.890462037",
    //         linkId: link1id,
    //     },
    // });

    console.log("Database seeded successfully!");
    // console.log({ payment1 });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
