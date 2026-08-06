    export interface Stage {
    id: string;
    label: string;
    }

    export interface Deal {
    id: number;
    customer: string;
    company: string;
    value: string;
    stage: string;
    closeDate: string;
    }

    export const STAGES: Stage[] = [
    { id: "lead", label: "Lead" },
    { id: "qualified", label: "Qualified" },
    { id: "proposal", label: "Proposal" },
    { id: "negotiation", label: "Negotiation" },
    { id: "closed_won", label: "Closed Won" },
    { id: "closed_lost", label: "Closed Lost" },
    ];

    export const DEALS: Deal[] = [
    {
        id: 1,
        customer: "Sarah Chen",
        company: "Acme Corp",
        value: "$24,000",
        stage: "negotiation",
        closeDate: "Jun 17",
    },
    {
        id: 2,
        customer: "Marcus Rivera",
        company: "TechFlow Inc",
        value: "$18,500",
        stage: "proposal",
        closeDate: "Jun 24",
    },
    {
        id: 3,
        customer: "Priya Nair",
        company: "CloudBase Ltd",
        value: "$41,000",
        stage: "qualified",
        closeDate: "Jul 1",
    },
    {
        id: 4,
        customer: "James O'Brien",
        company: "Retail Plus",
        value: "$9,200",
        stage: "lead",
        closeDate: "Jul 10",
    },
    {
        id: 5,
        customer: "Elena Vasquez",
        company: "HealthSync",
        value: "$67,000",
        stage: "closed_won",
        closeDate: "May 30",
    },
    {
        id: 6,
        customer: "Kwame Asante",
        company: "LogiCore",
        value: "$33,400",
        stage: "proposal",
        closeDate: "Jun 21",
    },
    ];