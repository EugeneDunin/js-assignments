'use strict';

/**
 * Возвращает массив из 32 делений катушки компаса с названиями.
 * Смотрите детали здесь:
 * https://en.wikipedia.org/wiki/Points_of_the_compass#32_cardinal_points
 *
 * @return {array}
 *
 * Пример возвращаемого значения :
 *  [
 *     { abbreviation : 'N',     azimuth : 0.00 ,
 *     { abbreviation : 'NbE',   azimuth : 11.25 },
 *     { abbreviation : 'NNE',   azimuth : 22.50 },
 *       ...
 *     { abbreviation : 'NbW',   azimuth : 348.75 }
 *  ]
 */
function createCompassPoints()
{
	var sides = ['N','E','S','W'],  // use array of cardinal directions only!
          result = [];
    
    for (let i = 0; i < 4; i++)
	{
        const from = i % 2 ? 2 : 5;
        for (let j = -from; j <= from; j++)
		{
            const pos = (i * 8 + j + 32) % 32, // current position in result
                  posi = (i + (j < 0 ? -1 : 1) + 4) % 4, // previous or next position in sides
                  ja = Math.abs(j);
            result[pos] = sides[i];
            if (j)
			{
                result[pos] +=
                    ja % 2 ?
                        (
                            (ja > 1 ? sides[posi] : '') +
                            'b' +
                            (ja === 3 ? sides[i] : sides[posi])
                        ) :
                        (
                            ja === 4 ?
                            sides[posi] :
                            (i % 2 ? sides[posi] + sides[i] : sides[i] + sides[posi])
                                
                        );
            }
        }
    }
	
    return result.map((v, i) => {
        return {
            abbreviation: v,
            azimuth: i * 11.25
        };
    });
}


/**
 * Раскройте фигурные скобки указанной строки.
 * Смотрите https://en.wikipedia.org/wiki/Bash_(Unix_shell)#Brace_expansion
 *
 * Во входной строке пары фигурных скобок, содержащие разделенные запятыми подстроки,
 * представляют наборы подстрок, которые могут появиться в этой позиции на выходе.
 *
 * @param {string} str
 * @return {Iterable.<string>}
 *
 * К СВЕДЕНИЮ: Порядок выходных строк не имеет значения.
 *
 * Пример:
 *   '~/{Downloads,Pictures}/*.{jpg,gif,png}'  => '~/Downloads/*.jpg',
 *                                                '~/Downloads/*.gif'
 *                                                '~/Downloads/*.png',
 *                                                '~/Pictures/*.jpg',
 *                                                '~/Pictures/*.gif',
 *                                                '~/Pictures/*.png'
 *
 *   'It{{em,alic}iz,erat}e{d,}, please.'  => 'Itemized, please.',
 *                                            'Itemize, please.',
 *                                            'Italicized, please.',
 *                                            'Italicize, please.',
 *                                            'Iterated, please.',
 *                                            'Iterate, please.'
 *
 *   'thumbnail.{png,jp{e,}g}'  => 'thumbnail.png'
 *                                 'thumbnail.jpeg'
 *                                 'thumbnail.jpg'
 *
 *   'nothing to do' => 'nothing to do'
 */
function* expandBraces(str)
{
	const queue = [str],
	exist = [];
	while (queue.length > 0)
	{
		str = queue.shift();
		let match = str.match(/\{([^{}]+)\}/);
		if (match)
		{
			for (let value of match[1].split(','))
			{
				queue.push(str.replace(match[0], value));
			}
        }
		else
		{
			if (exist.indexOf(str) < 0)
			{
				exist.push(str);
				yield str;
			}
        }
    }
}


/**
 * Возвращает ZigZag матрицу
 *
 * Основная идея в алгоритме сжатия JPEG -- отсортировать коэффициенты заданного изображения зигзагом и закодировать их.
 * В этом задании вам нужно реализовать простой метод для создания квадратной ZigZag матрицы.
 * Детали смотрите здесь: https://en.wikipedia.org/wiki/JPEG#Entropy_coding
 * https://ru.wikipedia.org/wiki/JPEG
 * Отсортированные зигзагом элементы расположаться так: https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/JPEG_ZigZag.svg/220px-JPEG_ZigZag.svg.png
 *
 * @param {number} n - размер матрицы
 * @return {array}  массив размером n x n с зигзагообразным путем
 *
 * @example
 *   1  => [[0]]
 *
 *   2  => [[ 0, 1 ],
 *          [ 2, 3 ]]
 *
 *         [[ 0, 1, 5 ],
 *   3  =>  [ 2, 4, 6 ],
 *          [ 3, 7, 8 ]]
 *
 *         [[ 0, 1, 5, 6 ],
 *   4 =>   [ 2, 4, 7,12 ],
 *          [ 3, 8,11,13 ],
 *          [ 9,10,14,15 ]]
 *
 */
function getZigZagMatrix(n)
{
    let row = 0,
    col = 0,
    direction = 0,
    arr = Array.from({length: n}, () => Array.from({length: n}));
    for (let i = 0; i < n * n; i++) {
        arr[row][col] = i;
        
        if (direction % 2) {
            row += direction % 4 === 1 ? 1 : -1;
            col += direction % 4 === 1 ? -1 : 1;
        }
		else
		{
			if ((direction % 4 === 0 && col < n - 1) || row === n - 1)
				col++;
			else
			row++
		}
        if (direction % 2 === 0 || row === 0 || row === n - 1 || col === 0 || col === n - 1)
            direction++;
    }
    return arr;
}


/**
 * Возвращает true если заданный набор костяшек домино может быть расположен в ряд по правилам игры.
 * Детали игры домино смотрите тут: https://en.wikipedia.org/wiki/Dominoes
 * https://ru.wikipedia.org/wiki/%D0%94%D0%BE%D0%BC%D0%B8%D0%BD%D0%BE
 * Каждая костяшка представлена как массив [x,y] из значений на ней.
 * Например, набор [1, 1], [2, 2], [1, 2] может быть расположен в ряд ([1, 1] -> [1, 2] -> [2, 2]),
 * тогда как набор [1, 1], [0, 3], [1, 4] не может.
 * К СВЕДЕНИЮ: в домино любая пара [i, j] может быть перевернута и представлена как [j, i].
 *
 * @params {array} dominoes
 * @return {bool}
 *
 * @example
 *
 * [[0,1],  [1,1]] => true
 * [[1,1], [2,2], [1,5], [5,6], [6,3]] => false
 * [[1,3], [2,3], [1,4], [2,4], [1,5], [2,5]]  => true
 * [[0,0], [0,1], [1,1], [0,2], [1,2], [2,2], [0,3], [1,3], [2,3], [3,3]] => false
 *
 */
function canDominoesMakeRow(dominoes)
{
    // убираем все дубли и подсчитываем кол-во вхождений каждой из цифр
	let res = false,
	cnt = Array.from({length: 7}, () => 0);
	dominoes = dominoes.filter((v, i) => {
		if (v[0] !== v[1])
		{
			cnt[v[0]]++;
			cnt[v[1]]++;
			return true;
		}
		else 
		{
			if (!dominoes.some((v1, i1) => i !== i1 && (v[0] === v1[0] || v[0] === v1[1])))
			{
				res = true;
				return false;
			}
		}
	});
    
    //Если некуда пристроить дубль
	if (res)
	{
		return false;
	}
    
	if (dominoes.length === 1)
	{
		return true;
	}
    
	// если нечётных количеств цифр больше 2, то домино сложить нельзя
	res = 0;
	for (let i = 0; i < 7; i++)
	{
		if (cnt[i] % 2)
		{
			res++;
		}
	}
	if (res > 2)
	{
		return false;
	}

    
    // комбинируем 2 кости и получаем все возможные варианты
	function* combine(domino1, domino2)
	{
		for (let i = 0; i < 2; i++)
		{
            for (let j = 0; j < 2; j++)
			{
				if (domino1[i] === domino2[j])
				{
					yield [domino1[1 - i], domino2[1 - j]];
				}
			}
		}
	}
    
	const exclude = Array.from({length: dominoes.length}, (v, i) => i);
	let excludeCount = 1;
    
	//Складываем кости всеми возможными путями
	function rec(domino)
	{
		if (excludeCount === dominoes.length)
		{
			return true;
		}
        for (let i = 1; i < dominoes.length; i++)
		{
			if (exclude[i])
			{
				exclude[i] = false;
				excludeCount++;
				for (let v of combine(domino, dominoes[i]))
				{
					if (rec(v))
					{
						return true;
					}
				}
				exclude[i] = true;
				excludeCount--;
			}
		}
		if (excludeCount === 1)
		{
			return false;
		}
	}
	return rec(dominoes[0]);
}


/**
 * Возвращает строковое представление заданного упорядоченного списка целых чисел.
 *
 * Строковое представление списка целых чисел будет состоять из элементов, разделенных запятыми. Элементами могут быть:
 *   - отдельное целое число
 *   - или диапазон целых чисел, заданный начальным числом, отделенным от конечного числа черточкой('-').
 *     (Диапазон включает все целые числа в интервале, включая начальное и конечное число)
 *     Синтаксис диапазона должен быть использован для любого диапазона, где больше двух чисел.
 *
 * @params {array} nums
 * @return {bool}
 *
 * @example
 *
 * [ 0, 1, 2, 3, 4, 5 ]   => '0-5'
 * [ 1, 4, 5 ]            => '1,4,5'
 * [ 0, 1, 2, 5, 7, 8, 9] => '0-2,5,7-9'
 * [ 1, 2, 4, 5]          => '1,2,4,5'
 */
function extractRanges(nums)
{
    let arr = [[nums[0]]];
    
    //Группируем в блоки последовательности
    for (let i = 1; i < nums.length; i++)
	{
        if (nums[i] - 1 === arr[arr.length - 1][arr[arr.length - 1].length - 1])
		{
            arr[arr.length - 1].push(nums[i]);
		}
        else
		{
            arr.push([nums[i]]);
		}
	}
    
    //Формируем диапазоны
	for (let i in arr)
	{
		if (arr[i].length > 2)
		{
			arr[i] = arr[i][0] + '-' + arr[i][arr[i].length - 1];
		}
		else
		{
			arr[i] = arr[i].join(',');
		}
	}
	return arr.join(',');
}

module.exports = {
    createCompassPoints : createCompassPoints,
    expandBraces : expandBraces,
    getZigZagMatrix : getZigZagMatrix,
    canDominoesMakeRow : canDominoesMakeRow,
    extractRanges : extractRanges
};
