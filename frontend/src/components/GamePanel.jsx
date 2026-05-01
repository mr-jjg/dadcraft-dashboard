import { useTable } from "../hooks/useTables";

export function GamePanel({ heading, endpoint}) {
    const { table, error } = useTable(endpoint);
    if (error) return <p>Error: {error.message}</p>;
    if (table == null) return <p>Loading...</p>;

    if (table.columns.length === 1) {
        return <p>{heading}: {table.rows[0][0]}</p>;
    }

    return (
        <>
            <p>{heading}</p>
            <table>
                <thead>
                    <tr>
                        {table.columns.map((col) => (
                            <th key={col}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {table.rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex}>{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}
