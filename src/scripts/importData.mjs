import express from "express";
import cors from "cors";

import multer from "multer";
import * as XLSX from "xlsx";
import bcrypt from "bcryptjs";

/* load 'fs' for readFile and writeFile support */
import * as fs from "fs";
XLSX.set_fs(fs);

/* load 'stream' for stream support */
import { Readable } from "stream";
XLSX.stream.set_readable(Readable);

/* load the codepage support library for extended support with older formats  */
import * as cpexcel from "xlsx/dist/cpexcel.full.mjs";
import { PrismaClient } from "@prisma/client";
XLSX.set_cptable(cpexcel);

var upload = multer({ dest: "uploads/" });

const app = express();
const prisma = new PrismaClient();

app.use(cors());

app.use(express.json());

function ExcelDateToJSDate(serial) {
  var utc_days = Math.floor(serial - 25569);
  var utc_value = utc_days * 86400;
  var date_info = new Date(utc_value * 1000);

  var fractional_day = serial - Math.floor(serial) + 0.0000001;

  var total_seconds = Math.floor(86400 * fractional_day);

  var seconds = total_seconds % 60;

  total_seconds -= seconds;

  var hours = Math.floor(total_seconds / (60 * 60));
  var minutes = Math.floor(total_seconds / 60) % 60;

  var date = new Date(
    date_info.getFullYear(),
    date_info.getMonth(),
    date_info.getDate(),
    hours,
    minutes,
    seconds
  );

  return date.toISOString().split(".")[0];
}

async function performMemberConversion(workbook) {
  const worksheet = workbook.Sheets["Members"];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  let errorCount = 0;

  // Iterate over each course and create a result entry
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let retryCount = 0;

    while (true) {
      try {
        const hashedPassword = await bcrypt.hash(
          // generate random string
          Math.random().toString(36).slice(-8),
          10
        ); // use bcryptjs to hash the password
        const value = row["Email1"] || row["FullName"];
        let email;

        if (value.includes("@")) {
          const emailParts = value.split("@");
          const emailName = emailParts[0];
          const emailDomain = emailParts[1];
          email =
            retryCount > 0
              ? `${emailName}+${retryCount}@${emailDomain}`
              : value;
        } else {
          email = retryCount > 0 ? `${value}${retryCount}` : value;
        }

        const member = await prisma.member.create({
          data: {
            id: row["ID"],
            name: row["FullName"],
            email: email,
            password: hashedPassword,
            role: row["IsSuperAdmin"] ? "ADMIN" : "ACTIVE",
            phone: row["Phone1"],
            facebook: row["Facebook"],
            address: row["Address"],
          },
        });
        break; // If the creation is successful, break the loop
      } catch (error) {
        if (error.code === "P2002" && error.meta.target.includes("email")) {
          // If the error is a unique constraint violation on the email field, retry with a modified email
          retryCount++;
        } else {
          console.log(error);
          console.log(i);
          console.log(rows[i]);
          ++errorCount;
          break; // If the error is not a unique constraint violation on the email field, break the loop
        }
      }
    }
  }

  console.log("There were " + errorCount + " errors");
}

async function performInvoiceTypeConversion(workbook) {
  const worksheet = workbook.Sheets["InvoiceTypes"];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  let errorCount = 0;

  // Iterate over each coures and create a result entry
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    try {
      const invoiceCategory = await prisma.invoiceCategory.create({
        data: {
          id: row["ID"],
          name: row["InvoiceType"],
        },
      });
      // const invoiceCategory = {
      //   id: row["ID"],
      //   name: row["InvoiceType"],
      // };

      // console.log(invoiceCategory);
    } catch (error) {
      console.log(error);
      console.log(i);
      console.log(rows[i]);
      ++errorCount;
    }
  }

  console.log("There were " + errorCount + " errors");
}

async function performInvoiceConversion(workbook) {
  const worksheet = workbook.Sheets["MemberInvoices"];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  let errorCount = 0;

  // Iterate over each coures and create a result entry
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    try {
      const invoice = await prisma.invoice.create({
        data: {
          id: row["Id"],
          member_id: row["MemberId"],
          category_id: row["PaymentTypeID"] || 3,
          code: row["CODE"],
          title: row["Title"],
          remarks: row["Description"],
          amount: row["Amount"],
          date: new Date(ExcelDateToJSDate(row["PostedDate"])),
        },
      });
      // const invoice = {
      //   id: row["ID"],
      //   name: row["InvoiceType"],
      // };

      // console.log(invoiceCategory);
    } catch (error) {
      console.log(error);
      console.log(i);
      console.log(rows[i]);
      ++errorCount;
    }
  }

  console.log("There were " + errorCount + " errors");
}

async function performMemberNotesConversion(workbook) {
  const worksheet = workbook.Sheets["MemberNotes"];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  let errorCount = 0;

  // Iterate over each coures and create a result entry
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    try {
      const note = await prisma.note.create({
        data: {
          id: row["Id"],
          target_member_id: row["MemberId"],
          posted_member_id: row["PostedMemberId"],
          posted_date: new Date(ExcelDateToJSDate(row["PostedDate"])),
          content: row["Description"],
        },
      });

      // const note = {
      //   id: row["Id"],
      //   target_member_id: row["MemberId"],
      //   posted_member_id: row["PostedMemberId"],
      //   posted_date: ExcelDateToJSDate(row["PostedDate"]),
      //   content: row["Description"],
      // };

      // console.log(note);
    } catch (error) {
      console.log(error);
      console.log(i);
      console.log(rows[i]);
      ++errorCount;
    }
  }

  console.log("There were " + errorCount + " errors");
}

async function performMemberPaymentsConversion(workbook) {
  const worksheet = workbook.Sheets["MemberPayments"];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  let errorCount = 0;

  // Iterate over each coures and create a result entry
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    try {
      // Create a variable to store the payment mode
      let mode;
      /* 
      Cheque -> CHEQUE
      Deposit -> DEPOSIT
      Cash -> CASH
      Credit Card Payment -> CREDIT_CARD
      Online Transfer -> BANK_TRANSFER
      */
      // Assign mode using that and row["PaymentMode"]
      switch (row["PaymentMode"]) {
        case "Cheque":
          mode = "CHEQUE";
          break;
        case "Deposit":
          mode = "DEPOSIT";
          break;
        case "Cash":
          mode = "CASH";
          break;
        case "Credit Card Payment":
          mode = "CREDIT_CARD";
          break;
        case "Online Transfer":
          mode = "BANK_TRANSFER";
          break;
        default:
          mode = "OTHER";
          break;
      }

      const payment = await prisma.payment.create({
        data: {
          id: row["Id"],
          member_id: row["MemberId"],
          verifier_id: BigInt(1),

          date: new Date(ExcelDateToJSDate(row["PaymentDate"])),
          amount: row["PaymentAmount"],
          mode,
          reference: row["PaymentReference"],
          remarks: row["Remarks"],
          is_auto_payment: false,
          status: "VERIFIED",
          verified_date: new Date(ExcelDateToJSDate(row["EntryDate"])),
        },
      });

      // const note = {
      //   id: row["Id"],
      //   target_member_id: row["MemberId"],
      //   posted_member_id: row["PostedMemberId"],
      //   posted_date: ExcelDateToJSDate(row["PostedDate"]),
      //   content: row["Description"],
      // };

      // console.log(note);
    } catch (error) {
      console.log(error);
      console.log(i);
      console.log(rows[i]);
      ++errorCount;
    }
  }

  console.log("There were " + errorCount + " errors");
}

async function performPlotConversion(workbook) {
  const worksheet = workbook.Sheets["PlotMaster"];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  let errorCount = 0;

  // Iterate over each coures and create a result entry
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    try {
      const property = await prisma.property.create({
        data: {
          id: row["ID"],
          survey: row["Survey"],
          plot_number: row["PLotNumber"],
          old_plot_number: row["OldNumber"],
          area: row["PlotSize"],
          is_fenced: false,
          has_cottage: false,
          has_electricity_connection: false,
          has_water_connection: false,
        },
      });

      // const note = {
      //   id: row["Id"],
      //   target_member_id: row["MemberId"],
      //   posted_member_id: row["PostedMemberId"],
      //   posted_date: ExcelDateToJSDate(row["PostedDate"]),
      //   content: row["Description"],
      // };

      // console.log(note);
    } catch (error) {
      console.log(error);
      console.log(i);
      console.log(rows[i]);
      ++errorCount;
    }
  }
}

async function performPlotOwnerConversion(workbook) {
  const worksheet = workbook.Sheets["PlotOwners"];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  let errorCount = 0;

  // Iterate over each coures and create a result entry
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    try {
      const ownedProperty = await prisma.ownedProperty.create({
        data: {
          id: row["Id"],
          member_id: row["MemberId"],
          property_id: row["PlotId"],
          // date_of_agreement: new Date(ExcelDateToJSDate(row["AgreementDate"])),
          // date_of_registration: new Date(
          //   ExcelDateToJSDate(row["RegistrationDate"])
          // ),
          ownership_status: row["ForSale"] == 0 ? "OWNER" : "SOLD",
        },
      });

      // const note = {
      //   id: row["Id"],
      //   target_member_id: row["MemberId"],
      //   posted_member_id: row["PostedMemberId"],
      //   posted_date: ExcelDateToJSDate(row["PostedDate"]),
      //   content: row["Description"],
      // };

      // console.log(note);
    } catch (error) {
      console.log(error);
      console.log(i);
      console.log(rows[i]);
      ++errorCount;
    }
  }

  console.log("There were " + errorCount + " errors");
}

async function generateUpdateSQLCommands(workbook) {
  const worksheet = workbook.Sheets["Members"];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  let errorCount = 0;
  let sqlStatements = "";

  // Iterate over each coures and create a result entry
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    const membershipNumber = row["MembershipNumber2"];
    if (!membershipNumber) {
      continue;
    }

    try {
      // const member = await prisma.member.update({
      //   data: {
      //     membership_number: row["MembershipNumber2"],
      //   },
      //   where: {
      //     id: row["ID"],
      //   },
      // });

      sqlStatements += `UPDATE "Member" SET membership_number = '${row["MembershipNumber2"]}' WHERE id = ${row["ID"]};\n`;
      // console.log(note);
    } catch (error) {
      console.log(error);
      console.log(i);
      console.log(rows[i]);
      ++errorCount;
    }
  }

  fs.writeFile("update_membership_number.sql", sqlStatements, (err) => {
    if (err) throw err;
    console.log(
      "SQL statements have been written to update_membership_number.sql"
    );
  });
}

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (req.file?.filename == null) {
      res.status(400).json("No File uploaded");
    } else {
      const workbook = XLSX.readFile(req.file?.path);

      // performMemberConversion(workbook);
      // performInvoiceTypeConversion(workbook);
      // performInvoiceConversion(workbook);
      // performMemberNotesConversion(workbook);
      // performMemberPaymentsConversion(workbook);
      // performPlotConversion(workbook);
      // performPlotOwnerConversion(workbook);
      generateUpdateSQLCommands(workbook);

      return res.status(200).json(result);
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

app.listen(3002, "127.0.0.1", () => {
  console.log("Server started at port 3002");
});

export default app;
