open System.IO


let removeComments (input: string) = input.Replace("//todo", "")
let filePath = "./Lead.tsx"
let todoLines = 
    File.ReadLines(filePath)
    |> Seq.map (fun line -> line.ToLower())
    |> Seq.filter (fun line -> line.Contains("todo"))
    |> Seq.choose (fun line ->
        let parts = line.Split(":")
        if parts.Length >= 2 then
                Some (parts.[0].Trim(), parts.[1].Trim())
            else
                None
        )

for line in todoLines do
    printfn "%s" (fst line)

for line in todoLines do
    fst line
    |> removeComments
    |> printfn "%s"
