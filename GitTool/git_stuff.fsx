#r "nuget: LibGit2Sharp"

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


let rootPath = findReposiotoryRoot ()
printfn "The root repository is :%s" rootPath
