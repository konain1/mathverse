/**
 * "Basics" lessons: the words a student needs before a topic (point, edge, face …).
 * Each concept = a title, 3 short lines, one real-life example, and an animation (see BasicsScene).
 * To add one: add it here, give it a case in BasicsScene, and list it in BASICS_BY_FAMILY.
 */
import { tx } from '@/topics/contract';
import type { LocalizedText, ShapeFamily } from '@/topics/types';

export interface Concept {
  id: string;
  title: LocalizedText;
  lines: [LocalizedText, LocalizedText, LocalizedText];
  example: LocalizedText;
  /** solid concepts get an angled camera, flat ones a top-down one */
  solid: boolean;
}

const c = (id: string, solid: boolean, title: [string, string, string], hl: string[], en: string[], hi: string[], ex: [string, string, string]): Concept => ({
  id,
  solid,
  title: tx(...title),
  lines: [0, 1, 2].map((i) => tx(hl[i]!, en[i]!, hi[i]!)) as Concept['lines'],
  example: tx(...ex),
});

export const CONCEPTS: Concept[] = [
  c('point', false, ['Point', 'Point', 'बिंदु'],
    ['Point ek jagah batata hai. Iski koi lambai ya chaudai nahi hoti.', 'Ise capital letter se naam dete hain: A, B, C.', 'Cube ke corners bhi points hain.'],
    ['A point marks a position. It has no length or width.', 'We name it with a capital letter: A, B, C.', 'The corners of a cube are points too.'],
    ['बिंदु एक स्थान बताता है। इसकी कोई लंबाई या चौड़ाई नहीं होती।', 'इसे बड़े अक्षर से नाम देते हैं: A, B, C।', 'घन के कोने भी बिंदु हैं।'],
    ['Kaagaz par pencil ki nok ka nishaan.', 'The dot a sharp pencil makes on paper.', 'कागज़ पर पेंसिल की नोक का निशान।']),
  c('line-segment', false, ['Line segment', 'Line segment', 'रेखाखंड'],
    ['Do points ko seedha jodne wali line: line segment.', 'Iske do sire hote hain, aur ek pakki lambai.', 'Ise AB likhte hain, aur ruler se naap sakte hain.'],
    ['The straight path joining two points is a line segment.', 'It has two end points and a fixed length.', 'We write it as AB and can measure it with a ruler.'],
    ['दो बिंदुओं को सीधा जोड़ने वाली रेखा: रेखाखंड।', 'इसके दो सिरे होते हैं, और एक निश्चित लंबाई।', 'इसे AB लिखते हैं, और रूलर से नाप सकते हैं।'],
    ['Pencil, ya deewar ka kinara.', 'A pencil, or the edge of a wall.', 'पेंसिल, या दीवार का किनारा।']),
  c('line', false, ['Line', 'Line', 'रेखा'],
    ['Line dono taraf bina ruke chalti rehti hai.', 'Iska koi sira nahi, isliye ise naap nahi sakte.', 'Dono taraf arrow lagate hain.'],
    ['A line goes on forever in both directions.', 'It has no end points, so it cannot be measured.', 'We draw arrows on both ends.'],
    ['रेखा दोनों ओर बिना रुके चलती रहती है।', 'इसका कोई सिरा नहीं, इसलिए इसे नाप नहीं सकते।', 'दोनों ओर तीर लगाते हैं।'],
    ['Rail ki patri jo door tak jaati dikhe.', 'Railway tracks that seem to go on forever.', 'रेल की पटरी जो दूर तक जाती दिखे।']),
  c('ray', false, ['Ray', 'Ray', 'किरण'],
    ['Ray ek point se shuru hoti hai aur ek taraf chalti rehti hai.', 'Iska sirf ek sira hota hai.', 'Ek taraf arrow lagate hain.'],
    ['A ray starts at a point and goes on in one direction.', 'It has only one end point.', 'We draw an arrow on one end.'],
    ['किरण एक बिंदु से शुरू होकर एक ओर चलती रहती है।', 'इसका सिर्फ़ एक सिरा होता है।', 'एक ओर तीर लगाते हैं।'],
    ['Torch ya sooraj ki roshni.', 'The beam of a torch, or sunlight.', 'टॉर्च या सूरज की रोशनी।']),
  c('angle', false, ['Angle', 'Angle', 'कोण'],
    ['Ek point se do rays niklein, to beech ka khulapan angle hai.', 'Wo point vertex kehlata hai.', 'Angle degree (°) mein naapte hain.'],
    ['Two rays from one point make an angle: the opening between them.', 'That point is called the vertex.', 'Angles are measured in degrees (°).'],
    ['एक बिंदु से दो किरणें निकलें, तो बीच का खुलाव कोण है।', 'वह बिंदु शीर्ष कहलाता है।', 'कोण अंश (°) में नापते हैं।'],
    ['Ghadi ki do suiyon ke beech.', 'Between the two hands of a clock.', 'घड़ी की दो सुइयों के बीच।']),
  c('right-angle', false, ['Right angle', 'Right angle', 'समकोण'],
    ['90° ka angle right angle hai.', 'Ise chhote square ke nishaan se dikhate hain.', 'Square, rectangle aur cube ke har corner par 90°.'],
    ['An angle of 90° is a right angle.', 'We mark it with a small square.', 'Every corner of a square, rectangle and cube is 90°.'],
    ['90° का कोण समकोण है।', 'इसे छोटे वर्ग के निशान से दिखाते हैं।', 'वर्ग, आयत और घन के हर कोने पर 90°।'],
    ['Kitaab ka kona.', 'The corner of a book.', 'किताब का कोना।']),
  c('vertex', true, ['Vertex (corner)', 'Vertex (corner)', 'शीर्ष (कोना)'],
    ['Jahan edges milti hain, wo corner vertex hai.', 'Ek se zyada hon to: vertices.', 'Cube mein 8 vertices hote hain.'],
    ['A corner where edges meet is a vertex.', 'More than one: vertices.', 'A cube has 8 vertices.'],
    ['जहाँ किनारे मिलते हैं, वह कोना शीर्ष है।', 'एक से ज़्यादा हों तो भी: शीर्ष।', 'घन में 8 शीर्ष होते हैं।'],
    ['Dibbe ka nukila kona.', 'The pointed corner of a box.', 'डिब्बे का नुकीला कोना।']),
  c('edge', true, ['Edge', 'Edge', 'किनारा'],
    ['Do faces jahan milte hain, wo line segment edge hai.', 'Har edge do vertices ko jodta hai.', 'Cube mein 12 edges hoti hain, sab barabar.'],
    ['Where two faces meet, the line segment is an edge.', 'Each edge joins two vertices.', 'A cube has 12 edges, all equal.'],
    ['जहाँ दो फलक मिलते हैं, वह रेखाखंड किनारा है।', 'हर किनारा दो शीर्षों को जोड़ता है।', 'घन में 12 किनारे होते हैं, सब बराबर।'],
    ['Mez ka kinara.', 'The edge of a table.', 'मेज़ का किनारा।']),
  c('face', true, ['Face', 'Face', 'फलक'],
    ['Solid ki flat satah face kehlati hai.', 'Cube ka har face ek square hai.', 'Cube mein 6 faces hote hain.'],
    ['A flat surface of a solid is a face.', 'Every face of a cube is a square.', 'A cube has 6 faces.'],
    ['ठोस की सपाट सतह फलक कहलाती है।', 'घन का हर फलक एक वर्ग है।', 'घन में 6 फलक होते हैं।'],
    ['Paase (dice) ki har side.', 'Each side of a dice.', 'पासे की हर सतह।']),
  c('cube', true, ['Cube', 'Cube', 'घन'],
    ['Cube ki lambai, chaudai aur oonchai teeno barabar hoti hain.', '6 square faces, 12 barabar edges, 8 vertices.', 'Har corner par 90°.'],
    ['A cube has equal length, breadth and height.', '6 square faces, 12 equal edges, 8 vertices.', 'Every corner is 90°.'],
    ['घन की लंबाई, चौड़ाई और ऊँचाई तीनों बराबर होती हैं।', '6 वर्ग फलक, 12 बराबर किनारे, 8 शीर्ष।', 'हर कोने पर 90°।'],
    ['Ludo ka paasa, Rubik’s cube.', 'A dice, a Rubik’s cube.', 'लूडो का पासा, रूबिक क्यूब।']),
  c('cuboid', true, ['Cuboid', 'Cuboid', 'घनाभ'],
    ['Cuboid ki teen alag dimensions: length, breadth, height.', '6 rectangle faces; saamne wale faces barabar.', 'Cube bhi ek khaas cuboid hai (teeno barabar).'],
    ['A cuboid has three dimensions: length, breadth, height.', '6 rectangular faces; opposite faces are equal.', 'A cube is a special cuboid (all three equal).'],
    ['घनाभ की तीन विमाएँ: लंबाई, चौड़ाई, ऊँचाई।', '6 आयताकार फलक; आमने-सामने के फलक बराबर।', 'घन भी एक ख़ास घनाभ है (तीनों बराबर)।'],
    ['Matchbox, eent, kitaab.', 'A matchbox, a brick, a book.', 'माचिस की डिब्बी, ईंट, किताब।']),
  c('net', true, ['Net', 'Net', 'जाल'],
    ['Solid ko khol ke flat karo to net banta hai.', 'Cube ka net 6 squares ka hota hai.', 'Net ko mod ke wapas cube bana sakte hain.'],
    ['Open a solid out flat and you get its net.', 'A cube’s net is made of 6 squares.', 'Fold the net back up and you get the cube again.'],
    ['ठोस को खोलकर सपाट करो तो जाल बनता है।', 'घन का जाल 6 वर्गों का होता है।', 'जाल को मोड़कर फिर से घन बना सकते हैं।'],
    ['Khula hua mithai ka dibba.', 'A sweet box opened out flat.', 'खोला हुआ मिठाई का डिब्बा।']),
  c('unit-cube', true, ['Unit cube', 'Unit cube', 'इकाई घन'],
    ['1 cm × 1 cm × 1 cm ka chhota cube.', 'Iska volume 1 cm³ hai.', 'Volume naapne ki ikai yahi hai.'],
    ['A small cube 1 cm × 1 cm × 1 cm.', 'Its volume is 1 cm³.', 'This is the unit we measure volume with.'],
    ['1 cm × 1 cm × 1 cm का छोटा घन।', 'इसका आयतन 1 cm³ है।', 'आयतन नापने की इकाई यही है।'],
    ['Cheeni ka chhota cube.', 'A small sugar cube.', 'चीनी का छोटा घन।']),
  c('volume', true, ['Volume', 'Volume', 'आयतन'],
    ['Solid kitni jagah gherta hai: volume.', 'Gino kitne unit cubes andar aate hain.', 'Unit: cm³ (cubic cm).'],
    ['Volume is how much space a solid takes up.', 'Count how many unit cubes fit inside.', 'Unit: cm³ (cubic centimetres).'],
    ['ठोस कितनी जगह घेरता है: आयतन।', 'गिनो कितने इकाई घन अंदर आते हैं।', 'इकाई: cm³ (घन सेंटीमीटर)।'],
    ['Dibbe mein kitna saamaan aayega.', 'How much a box can hold.', 'डिब्बे में कितना सामान आएगा।']),
  c('surface-area', true, ['Surface area', 'Surface area', 'पृष्ठीय क्षेत्रफल'],
    ['Saare faces ka area jodo: surface area.', 'Cube: 6 faces, har ek a × a.', 'Unit: cm² (square cm).'],
    ['Add up the areas of all the faces: surface area.', 'Cube: 6 faces, each a × a.', 'Unit: cm² (square centimetres).'],
    ['सभी फलकों का क्षेत्रफल जोड़ो: पृष्ठीय क्षेत्रफल।', 'घन: 6 फलक, हर एक a × a।', 'इकाई: cm² (वर्ग सेंटीमीटर)।'],
    ['Dibbe ko lapetne mein kitna kaagaz lagega.', 'How much paper it takes to wrap a box.', 'डिब्बे को लपेटने में कितना कागज़ लगेगा।']),
  c('triangle', false, ['Triangle', 'Triangle', 'त्रिभुज'],
    ['Teen line segments se bani band shape: triangle.', '3 sides, 3 vertices, 3 angles.', 'Teeno angles milkar 180°.'],
    ['A closed shape made of three line segments: a triangle.', '3 sides, 3 vertices, 3 angles.', 'The three angles add up to 180°.'],
    ['तीन रेखाखंडों से बनी बंद आकृति: त्रिभुज।', '3 भुजाएँ, 3 शीर्ष, 3 कोण।', 'तीनों कोण मिलकर 180°।'],
    ['Samose ki shape, chetavni ka sign.', 'A samosa, a warning sign.', 'समोसे का आकार, चेतावनी का चिह्न।']),
  c('square', false, ['Square', 'Square', 'वर्ग'],
    ['Chaar barabar sides aur chaar right angles.', 'Dono diagonals barabar hote hain.', 'Cube ka har face square hai.'],
    ['Four equal sides and four right angles.', 'Both diagonals are equal.', 'Every face of a cube is a square.'],
    ['चार बराबर भुजाएँ और चार समकोण।', 'दोनों विकर्ण बराबर होते हैं।', 'घन का हर फलक वर्ग है।'],
    ['Carrom board, chess board ka khana.', 'A carrom board, a chessboard square.', 'कैरम बोर्ड, शतरंज का खाना।']),
  c('rectangle', false, ['Rectangle', 'Rectangle', 'आयत'],
    ['Saamne wali sides barabar, chaaron angles 90°.', 'Lambi side length, chhoti side breadth.', 'Cuboid ke faces rectangles hote hain.'],
    ['Opposite sides equal, all four angles 90°.', 'The long side is the length, the short one the breadth.', 'A cuboid’s faces are rectangles.'],
    ['आमने-सामने की भुजाएँ बराबर, चारों कोण 90°।', 'लंबी भुजा लंबाई, छोटी भुजा चौड़ाई।', 'घनाभ के फलक आयत होते हैं।'],
    ['Darwaza, mobile ki screen.', 'A door, a phone screen.', 'दरवाज़ा, मोबाइल की स्क्रीन।']),
  c('perimeter', false, ['Perimeter', 'Perimeter', 'परिमाप'],
    ['Shape ke chaaron taraf ek chakkar ki lambai.', 'Saari sides jodo.', 'Unit: cm.'],
    ['The length of one trip around a shape.', 'Add up all the sides.', 'Unit: cm.'],
    ['आकृति के चारों ओर एक चक्कर की लंबाई।', 'सभी भुजाएँ जोड़ो।', 'इकाई: cm।'],
    ['Khet ke chaaron taraf baad.', 'The fence around a field.', 'खेत के चारों ओर बाड़।']),
  c('area', false, ['Area', 'Area', 'क्षेत्रफल'],
    ['Shape kitni flat jagah gherti hai: area.', 'Gino kitne 1 cm ke squares andar aate hain.', 'Unit: cm².'],
    ['Area is how much flat space a shape covers.', 'Count how many 1 cm squares fit inside.', 'Unit: cm².'],
    ['आकृति कितनी सपाट जगह घेरती है: क्षेत्रफल।', 'गिनो कितने 1 cm के वर्ग अंदर आते हैं।', 'इकाई: cm²।'],
    ['Farsh par kitni tiles lagengi.', 'How many tiles cover a floor.', 'फ़र्श पर कितनी टाइलें लगेंगी।']),
  c('diagonal', false, ['Diagonal', 'Diagonal', 'विकर्ण'],
    ['Ek corner se saamne wale corner tak ka line segment.', 'Square aur rectangle mein 2 diagonals.', 'Diagonal shape ko do triangles mein baantta hai.'],
    ['A line segment from one corner to the opposite corner.', 'A square or rectangle has 2 diagonals.', 'A diagonal splits the shape into two triangles.'],
    ['एक कोने से सामने वाले कोने तक का रेखाखंड।', 'वर्ग और आयत में 2 विकर्ण।', 'विकर्ण आकृति को दो त्रिभुजों में बाँटता है।'],
    ['Patang ki do teeliyan.', 'The two sticks of a kite.', 'पतंग की दो तीलियाँ।']),
];

export const CONCEPT_BY_ID = new Map(CONCEPTS.map((x) => [x.id, x]));

/** What a student should know before each shape family's topics, in reading order. */
export const BASICS_BY_FAMILY: Record<ShapeFamily, string[]> = {
  cube: ['point', 'line-segment', 'vertex', 'edge', 'face', 'cube', 'cuboid', 'net', 'unit-cube', 'volume', 'surface-area'],
  square: ['point', 'line-segment', 'line', 'ray', 'angle', 'right-angle', 'square', 'perimeter', 'area', 'diagonal'],
  rectangle: ['point', 'line-segment', 'line', 'ray', 'angle', 'right-angle', 'rectangle', 'perimeter', 'area', 'diagonal'],
  triangle: ['point', 'line-segment', 'line', 'ray', 'angle', 'right-angle', 'triangle', 'perimeter', 'area'],
};
