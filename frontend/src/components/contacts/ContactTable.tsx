    "use client";

    import Link from "next/link";
    import { Contact } from "./types";


    interface Props {
  contacts: Contact[];
  onDelete: (id: number) => void;
}

    export default function ContactTable({ contacts,onDelete }: Props) {

    return (

        <div
  style={{
    background: "#ffffff",
    borderRadius: "16px",
    padding: "16px",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
    border: "1px solid #d1d5db",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  }}
>


      <table
  style={{
    width: "100%",
    minWidth: "760px",
    borderCollapse: "collapse",
  }}
>


            <thead>

            <tr
                style={{
                background:"#f8fafc",
                }}
            >

                <th style={headerStyle}>
                Name
                </th>


                <th style={headerStyle}>
                Company
                </th>


                <th style={headerStyle}>
                Email
                </th>


                <th style={headerStyle}>
                Phone
                </th>


                <th style={headerStyle}>
                Status
                </th>


                <th style={headerStyle}>
                Action
                </th>


            </tr>

            </thead>



            <tbody>


            {
                contacts.map((contact)=>(

                <tr

                    key={contact.id}

                    onMouseEnter={(e)=>
                    e.currentTarget.style.background="#f9fafb"
                    }

                    onMouseLeave={(e)=>
                    e.currentTarget.style.background="#ffffff"
                    }

                >



                    <td style={cellStyle}>
                    <strong
                        style={{
                        color:"#111827",
                        }}
                    >
                        {contact.fullName}
                    </strong>
                    </td>




                    <td style={cellStyle}>
                    {contact.company}
                    </td>



                    <td style={cellStyle}>
                    {contact.email}
                    </td>



                    <td style={cellStyle}>
                    {contact.phone}
                    </td>




                    <td style={cellStyle}>

                    <span
                        style={{

                        padding:"6px 14px",

                        borderRadius:"20px",

                        fontSize:"12px",

                        fontWeight:600,


                        background:

                        contact.status==="Active"
                        ?
                        "#dcfce7"

                        :

                        contact.status==="Lead"
                        ?
                        "#dbeafe"

                        :

                        "#e5e7eb",



                        color:

                        contact.status==="Active"
                        ?
                        "#166534"

                        :

                        contact.status==="Lead"
                        ?
                        "#1d4ed8"

                        :

                        "#374151",


                        }}
                    >

                        {contact.status}

                    </span>


                    </td>





                    <td style={cellStyle}>


                  <div
  style={{
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  }}
>



                        {/* VIEW */}

                        <Link

                        href={`/contacts/${contact.id}`}

                        style={{
                            ...buttonStyle,
                            background:"#e0e7ff",
                            color:"#3730a3",
                        }}

                        >

                        View

                        </Link>





                        {/* EDIT */}

                        <Link

                        href={`/contacts/edit?id=${contact.id}`}

                        style={{
                            ...buttonStyle,
                            background:"#dcfce7",
                            color:"#166534",
                        }}

                        >

                        Edit

                        </Link>





                        {/* DELETE */}

                       <button
  onClick={() => {

    const confirmDelete = window.confirm(
      `Delete ${contact.fullName}?`
    );

    if(confirmDelete){
      onDelete(contact.id);
    }

  }}

  style={{
    ...buttonStyle,
    background:"#fee2e2",
    color:"#991b1b",
    cursor:"pointer",
  }}
>
Delete
</button>



                    </div>


                    </td>



                </tr>


                ))
            }



            </tbody>


        </table>


        </div>

    );

    }




    const headerStyle = {

    padding:"16px",

    textAlign:"left" as const,

    fontSize:"14px",

    fontWeight:700,

    color:"#111827",

    background:"#f1f5f9",

    borderBottom:"1px solid #cbd5e1",

    };



   const cellStyle = {
  padding: "14px 12px",
  fontSize: "14px",
  color: "#374151",
  borderBottom: "1px solid #e5e7eb",
};



const buttonStyle = {
  padding: "8px 12px",
  borderRadius: "8px",
  border: "none",
  textDecoration: "none",
  fontSize: "12px",
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap" as const,
};