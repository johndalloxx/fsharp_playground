// For more information see https://aka.ms/fsharp-console-apps
open LibGit2Sharp
open System
open System.IO

let findReposiotoryRoot () =
    let currentDirectory = Environment.CurrentDirectory
    let rec findRoot currentPath = 
        try 
            use repo = new Repository(currentPath)
            Some(repo.Info.WorkingDirectory)
        with
        | :? RepositoryNotFoundException ->
            let parentPath = Directory.GetParent(currentPath)
            if parentPath = null then
                None
            else
                findRoot parentPath.FullName

    findRoot currentDirectory


let processFileType (file: string) =
    let extension = Path.GetExtension(file)
    match extension with
    | ".cs" -> printfn "C# file: %s" file
    | ".fs" -> printfn "F# file: %s" file
    | ".tsx" -> printfn "React file: %s" file
    | _ ->  ()

[<EntryPoint>]
let main _ =
    match findReposiotoryRoot() with
    | Some rootPath ->
        let repo = new Repository(rootPath)
        printfn "%s" repo.Info.WorkingDirectory

        let folders = Directory.GetDirectories(rootPath)
        for entry in folders do
            let files = Directory.GetFiles(entry)
            for file in files do
                processFileType file
        0
    | None ->
        printfn "Error: No Git repository found in any of the parent directories."
        1 
