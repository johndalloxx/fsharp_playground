// For more information see https://aka.ms/fsharp-console-apps
open LibGit2Sharp
open System
open System.IO

let findReposiotoryRoot () =
    let currentDirectory = Environment.CurrentDirectory
    let rec findRoot currentPath = 
        try 
            use repo = new Repository(currentPath)
            repo.Info.WorkingDirectory
        with
        | :? RepositoryNotFoundException ->
            let parentPath = Directory.GetParent(currentPath)
            if parentPath = null then
                failwith "No Git repository found in any of the parent directories"
            else
                findRoot parentPath.FullName

    findRoot currentDirectory


[<EntryPoint>]
let main _ =
    let rootPath = findReposiotoryRoot ()
    let repo = new Repository(rootPath)
    printfn "%s" repo.Info.WorkingDirectory
    let folders = Directory.GetDirectories(rootPath)
    for entry in folders do
        let files = Directory.GetFiles(entry)
        for file in files do
            printfn "%s" file
    0 // return an integer exit code
