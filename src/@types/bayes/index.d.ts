declare module "bayes" {
    export default class Naivebayes {
        learn(text: string, category: string): Naivebayes
        toJson(): string
    }

}
