/* eslint-disable no-console */
import { Region } from "./leaflet/Region";
import { Countries } from "./leaflet/Countries";
import { USCounties } from "./leaflet/USCounties";
import { USStates } from "./leaflet/USStates";
import { Leaflet } from "./leaflet/Leaflet";

export class Test1 extends Countries {

    constructor() {
        super();
        this
            .columns(["Country", "Weight"])
            .data([["United States", 29.946185501741], ["China", 229.946185501741], ["Ireland", 400]])
            .on("click", (row, col, sel) => {
                console.log("CLICKITY CLICK");
            })
            ;
    }
}

export class Test2 extends USStates {

    constructor() {
        super();
        this
            .columns(["State ID", "Weight"])
            .data([["AL", 4779736], ["AK", 710231], ["AZ", 6392017], ["AR", 2915918], ["CA", 37253956], ["CO", 5029196], ["CT", 3574097], ["DC", 601723], ["FL", 18801310], ["GA", 9687653], ["HI", 1360301], ["ID", 1567582], ["IL", 12830632], ["IN", 6483802], ["IA", 3046355], ["ME", 1328361], ["MD", 5773552], ["MA", 6547629], ["MI", 9883640], ["MN", 5303925], ["MS", 2967297], ["MO", 5988927], ["MT", 989415], ["NE", 1826341], ["NV", 2700551], ["NH", 1316470], ["NJ", 8791894], ["NM", 2059179], ["NY", 19378102], ["NC", 9535483], ["ND", 672591], ["OH", 11536504], ["OK", 3751351], ["OR", 3831074], ["PA", 12702379], ["RI", 1052567], ["SC", 4625364], ["SD", 814180], ["TN", 6346105], ["TX", 25145561], ["UT", 2763885], ["VT", 625741], ["VA", 8001024], ["WA", 6724540], ["WV", 1852994], ["WI", 5686986], ["WY", 563626]])
            .on("click", (row, col, sel) => {
                console.log("CLICKITY CLICK");
            })
            ;

    }
}

export class Test3 extends USCounties {

    constructor() {
        super();
        this
            .columns(["Fips Code", "Weight"])
            .data([["01073", 29.946185501741], ["01097", 0.79566003616637], ["01117", 1.5223596574691], ["04005", 27.311773623042], ["04013", 34.386239749349], ["04015", 34.670437987486], ["04019", 31.969766028563], ["04021", 32.050522991908], ["04025", 34.134956874683], ["04027", 39.511527048619], ["05119", 21.796200345423], ["06001", 30.243180376401], ["06007", 32.895132965379], ["06009", 31.181727904667], ["06013", 32.185196670086], ["06017", 33.085461795452], ["06019", 31.700962642409], ["06023", 31.504164625184], ["06025", 33.086419753086], ["06029", 31.370903445093], ["06031", 30.037376826368], ["06037", 32.862228288436], ["06039", 31.691553376421], ["06041", 33.940594059406], ["06045", 32.19390926041], ["06047", 17.699115044248], ["06053", 34.339622641509], ["06055", 34.272114240381], ["06057", 34.12581216775], ["06059", 34.094352964946], ["06061", 33.368700265252], ["06065", 34.378409504182], ["06067", 31.127455133963], ["06071", 28.061278815951], ["06073", 33.416802684537], ["06075", 32.679686882265], ["06077", 33.220663908788], ["06079", 34.654426692559], ["06081", 38.130056937369], ["06083", 33.631012786686], ["06085", 23.539289157001], ["06087", 33.450792851749], ["06089", 33.199951497514], ["06095", 29.988272742503], ["06097", 32.117851341511], ["06099", 28.860983743226], ["06101", 30.02277904328], ["06107", 30.886966441677], ["06111", 32.241761994195], ["06113", 33.095684803002], ["08001", 36.59961064244], ["08005", 35.375019172759], ["08013", 14.409178959917], ["08031", 29.526387009472], ["08035", 34.816606207175], ["08041", 35.803302523627], ["08059", 30.013848159009], ["08069", 31.525663161199], ["08077", 6.4506267196576], ["08101", 13.887799136916], ["08123", 13.152569809794], ["09001", 5.7392073825928], ["09003", 4.1802067946824], ["09005", 4.0793517742386], ["09007", 5.5014146494813], ["09009", 4.5156537753223], ["09011", 5.0602409638554], ["10003", 32.839907589629], ["11001", 9.2949842160645], ["12001", 10.877270713336], ["12005", 36.272040302267], ["12009", 11.407698791795], ["12011", 23.280277164089], ["12015", 12.530881141916], ["12017", 31.700110796504], ["12019", 35.153278138286], ["12021", 15.993998499625], ["12031", 34.893654890095], ["12033", 11.185959936182], ["12035", 18.70760442699], ["12053", 9.1261739485504], ["12055", 28.057742782152], ["12057", 26.866557815051], ["12061", 10.33669311602], ["12069", 13.579952267303], ["12071", 13.640759797284], ["12073", 10.285270716088], ["12081", 14.247875510429], ["12083", 33.329608938547], ["12085", 19.259129213483], ["12086", 27.092726418329], ["12087", 19.3515704154], ["12091", 29.375576745617], ["12095", 29.856149076143], ["12097", 14.039249514772], ["12099", 30.592551486003], ["12101", 25.170105355575], ["12103", 28.425946424618], ["12105", 28.673352628391], ["12109", 35.882708585248], ["12111", 12.200208550574], ["12113", 13.362801768106], ["12115", 33.847820200379], ["12117", 26.554468579008], ["12127", 26.636455186304], ["12131", 31.245500359971], ["13067", 4.539857154585], ["13089", 9.747504403993], ["13121", 13.174338679442], ["13135", 6.4834390415786], ["15001", 15.918023582257], ["15003", 22.138866719872], ["15007", 63.105998356615], ["15009", 27.947348340328], ["17031", 13.833973012769], ["17043", 30.967531997975], ["17089", 33.050309474687], ["17097", 11.594933064632], ["17111", 32.527401676338], ["17143", 4.8459804658152], ["17163", 5.1138238205213], ["17197", 26.516622872158], ["17201", 5.1221247332227], ["18097", 12.886209495102], ["22033", 3.0595813204509], ["24003", 6.6849100860047], ["24005", 5.1798561151079], ["24013", 7.6580226904376], ["24017", 5.6275122822689], ["24021", 5.8358521274122], ["24025", 7.137490608565], ["24027", 6.3063063063063], ["24031", 6.4765062307077], ["24033", 6.9953804091638], ["24043", 7.9417293233083], ["24047", 16.55126937026], ["24510", 8.2386000766381], ["25001", 17.454806656291], ["25005", 7.4465049928673], ["25009", 12.506881996697], ["25013", 8.0384380719951], ["25017", 27.939008042895], ["25021", 24.315648164361], ["25023", 13.348746653687], ["25025", 12.415510494486], ["25027", 8.4754797441365], ["26049", 7.9543628475012], ["26065", 6.1461497230659], ["26075", 3.9448669201521], ["26081", 3.5925196850394], ["26093", 4.7977422389464], ["26099", 8.4649655731065], ["26145", 3.8956266078648], ["26161", 12.490241998439], ["27003", 35.361438748102], ["27019", 35.444806707033], ["27037", 3.7469454249253], ["27053", 25.479191584629], ["27123", 27.0296014068], ["27137", 13.218235770165], ["27139", 4.1739130434783], ["27163", 2.2402757262432], ["27171", 32.163742690058], ["29095", 27.766490586482], ["29183", 31.629914829075], ["29189", 43.333848292909], ["29510", 32.204861111111], ["31109", 2.2465753424658], ["32003", 31.380314013042], ["32031", 24.548452960578], ["34001", 25.995919682165], ["34003", 6.9890009165903], ["34005", 10.048802129547], ["34007", 8.2412255187124], ["34009", 19.508037018997], ["34013", 9.9226139294927], ["34015", 30.202724105163], ["34017", 24.161710197397], ["34021", 8.074222668004], ["34023", 9.2441860465116], ["34025", 9.3353822512486], ["34027", 17.225352112676], ["34029", 37.018672038429], ["34031", 8.7633451957295], ["34035", 8.638148377764], ["34037", 29.534510433387], ["34039", 31.89460476788], ["34041", 29.438717067583], ["35001", 28.118628359592], ["36001", 3.9375203384315], ["36005", 30.396841886557], ["36007", 5.097312326228], ["36027", 4.2664670658683], ["36029", 7.2621727283497], ["36047", 17.225350853669], ["36055", 7.4890687505814], ["36059", 5.2696619295613], ["36061", 34.155087404751], ["36063", 10.821554770318], ["36067", 4.6743533811156], ["36071", 8.2626453031731], ["36079", 14.148471615721], ["36081", 15.364354697103], ["36085", 6.269637246501], ["36087", 27.891763306572], ["36091", 6.2885689097855], ["36093", 4.4991511035654], ["36103", 7.5394862036156], ["36111", 12.761714855434], ["36119", 29.387637203928], ["37021", 11.221203864256], ["37063", 15.128449096099], ["37067", 9.2007937939744], ["37081", 28.909542850967], ["37119", 33.987464880052], ["37179", 26.785714285714], ["37183", 8.7896810071831], ["39017", 11.786600496278], ["39023", 14.401858304297], ["39025", 13.625229638702], ["39035", 12.534629658669], ["39041", 14.716382387941], ["39049", 10.798621668187], ["39057", 11.068539804172], ["39061", 36.769337122667], ["39085", 12.217071175348], ["39093", 13.587223587224], ["39095", 13.123076923077], ["39099", 31.380076783189], ["39103", 16.013693419551], ["39113", 26.50459988693], ["39151", 15.11240632806], ["39153", 13.199693285135], ["39155", 29.438246232139], ["39165", 13.73673644967], ["40109", 27.656619689332], ["40143", 25.915538104015], ["41005", 25.209182578846], ["41017", 12.440905697935], ["41029", 27.052127022169], ["41039", 25.60987654321], ["41047", 10.069371452596], ["41051", 24.120918984281], ["41067", 25.706513525767], ["42003", 22.365269461078], ["42011", 24.786427626038], ["42017", 21.367236348479], ["42029", 21.769354602664], ["42043", 6.369785794814], ["42045", 15.37927114255], ["42049", 22.071725411728], ["42071", 20.179372197309], ["42077", 7.3121191604604], ["42091", 18.260730642241], ["42095", 8.6726998491704], ["42101", 7.0216526734423], ["42129", 1.5865820489574], ["42133", 1.5625], ["45013", 29.319371727749], ["45015", 18.962510897995], ["45019", 30.38401077925], ["45045", 9.6022727272727], ["45051", 6.7260370283572], ["45079", 31.786731786732], ["45083", 4.8632218844985], ["47037", 26.933155217592], ["47065", 4.0015769761482], ["47093", 3.7659811006115], ["47157", 17.265944442103], ["47165", 40.969162995595], ["47187", 11.318009892348], ["48029", 9.6375679095036], ["48039", 17.557251908397], ["48085", 9.860788863109], ["48113", 9.6153846153846], ["48121", 7.3293172690763], ["48141", 12.724623603691], ["48157", 12.584009269988], ["48167", 16.02023608769], ["48201", 4.6453017154967], ["48339", 31.846984275992], ["48439", 7.9620017628048], ["48453", 13.826591210787], ["49011", 40.058055152395], ["49035", 27.558536096065], ["49049", 17.96860223189], ["49057", 38.2081061863], ["51041", 24.315143545913], ["51059", 7.9613616888681], ["51087", 24.006772009029], ["51107", 7.3784722222222], ["51153", 6.8582432232262], ["51760", 16.079158936302], ["53011", 10.591067130249], ["53033", 31.749109104673], ["53035", 13.962395543175], ["53053", 12.965240468639], ["53061", 11.663844199831], ["53063", 9.5754829477701], ["53067", 11.969351832678], ["53073", 36.384766672626], ["53077", 6.7676289635589], ["55009", 2.4074631357207], ["55079", 14.943187741061], ["55133", 8.5109742618033]])
            ;
    }
}

export class Test4 extends Region {

    constructor() {
        super();
        this
            .region("BR")
            .columns(["Region", "Weight"])
            .data([["BA", 100], ["MS", 200]])
            .on("click", (row, col, sel) => {
                console.log("CLICKITY CLICK");
            })
            ;
    }
}

const toptGB = new Region()
    .region("GB")
    .columns(["Region", "Weight"])
    .data([["Greater London", 100], ["Greater Manchester", 200]])
    ;

const toptND = new Region()
    .region("ND")
    .columns(["Region", "Weight"])
    .data([["Omagh", 50]])
    ;

export class Test5 extends Leaflet {

    constructor() {
        super();
        this.layers([
            toptGB,
            toptND
        ]);
    }
}

export class Test extends Region {

    constructor() {
        super();
        this
            .region("GB")
            .columns(["Region", "Weight"])
            .data([["Greater London", 100], ["Greater Manchester", 200]])
            ;
        setTimeout(() => {
            this
                .region("IE")
                .render()
                ;
        }, 3000);
        setTimeout(() => {
            this
                .region("BR")
                .render()
                ;
        }, 6000);
        setTimeout(() => {
            this
                .region("GB")
                .render()
                ;
        }, 9000);
    }
}